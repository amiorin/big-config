from __future__ import annotations

import traceback
from collections.abc import Callable, Iterable, Mapping
from functools import partial
from typing import Any

from . import ERR, EXIT, STACK_TRACE
from .utils import BigConfigError, keyword, namespace, to_fn

Opts = dict[str, Any]
Step = str
StepFn = Callable[[Callable[[Step, Opts], Opts], Step, Opts], Opts]
WireFn = Callable[[Step, list[StepFn]], tuple[Callable[[Opts], Opts], Step | None] | list[Any]]
NextFn = Callable[[Step, Step | None, Opts], tuple[Step | None, Opts]]


def ok(opts: Mapping[str, Any] | None = None) -> Opts:
    base = dict(opts or {})
    base.update({EXIT: 0, ERR: None})
    return base


def choice(args: Mapping[str, Any] | None = None, **kwargs: Any) -> tuple[Step | None, Opts]:
    data = dict(args or {}) | kwargs
    opts = data["opts"]
    return (data.get("on_success") if opts.get(EXIT) == 0 else data.get("on_failure"), opts)


def _compose(step_fns: Iterable[StepFn], f: Callable[[Opts], Opts]) -> Callable[[Step, Opts], Opts]:
    def base(_step: Step, opts: Opts) -> Opts:
        return f(opts)

    acc: Callable[[Step, Opts], Opts] = base
    for step_fn in step_fns:
        prev = acc

        def wrapped(step: Step, opts: Opts, step_fn: StepFn = step_fn, prev: Callable[[Step, Opts], Opts] = prev) -> Opts:
            return step_fn(prev, step, opts)

        acc = wrapped
    return acc


def _resolve_step_fns(step_fns: Iterable[Any]) -> list[StepFn]:
    return list(reversed([to_fn(f) for f in step_fns]))


def _try_f(f: Callable[[Step, Opts], Opts], step: Step, opts: Opts) -> Opts:
    try:
        return f(step, opts)
    except Exception as exc:  # noqa: BLE001
        data = dict(getattr(exc, "data", {}) if isinstance(exc, BigConfigError) else {})
        merged = dict(opts)
        merged.update(data)
        merged.update({ERR: str(exc), EXIT: 1, STACK_TRACE: "".join(traceback.format_exception(exc))})
        return merged


def _resolve_next_fn(next_fn: NextFn | None, last_step: Step) -> NextFn:
    if next_fn is not None:
        return next_fn

    def default_next(_step: Step, next_step: Step | None, opts: Opts) -> tuple[Step | None, Opts]:
        if next_step:
            return choice(on_success=next_step, on_failure=last_step, opts=opts)
        return None, opts

    return default_next


def _normalize_wire_result(result: tuple[Any, ...] | list[Any]) -> tuple[Callable[[Opts], Opts], Step | None]:
    if len(result) == 1:
        return result[0], None
    if len(result) >= 2:
        return result[0], result[1]
    raise ValueError("wire_fn must return [f] or [f, next_step]")


def workflow(wf_opts: Mapping[str, Any]) -> Callable[..., Any]:
    """Create a map-threading workflow, the Python equivalent of ``->workflow``."""

    first_step = wf_opts["first_step"] if "first_step" in wf_opts else wf_opts.get("first-step")
    if first_step is None:
        raise ValueError("first_step is required")
    last_step = wf_opts.get("last_step", wf_opts.get("last-step")) or keyword(namespace(first_step), "end")
    wire_fn: WireFn | None = wf_opts.get("wire_fn", wf_opts.get("wire-fn"))
    if wire_fn is None:
        raise ValueError("wire_fn is required")
    next_fn: NextFn | None = wf_opts.get("next_fn", wf_opts.get("next-fn"))

    def run(*args: Any) -> Any:
        if len(args) == 0:
            return [first_step, last_step]
        if len(args) != 2:
            raise TypeError("workflow expects either no args or (step_fns, opts)")
        step_fns0, opts0 = args
        if opts0 is None:
            raise ValueError("opts should never be nil")
        step_fns = _resolve_step_fns(step_fns0)
        step: Step | None = first_step
        opts: Opts = dict(opts0)
        while step:
            f0, next_step0 = _normalize_wire_result(wire_fn(step, step_fns))
            f = _compose(step_fns, f0)
            opts = _try_f(f, step, opts)
            if opts is None:
                raise BigConfigError("opts must never be nil", {"step": step})
            exit_code = opts.get(EXIT)
            if not (isinstance(exit_code, int) and exit_code >= 0):
                raise BigConfigError(":big-config/exit must be a natural number", opts)
            next_step, opts = _resolve_next_fn(next_fn, last_step)(step, next_step0, opts)
            step = next_step
        return opts

    return run


def step_fn(config: Mapping[str, Any]) -> StepFn:
    before_f = config.get("before_f", config.get("before-f"))
    after_f = config.get("after_f", config.get("after-f"))
    if before_f is None and after_f is None:
        raise ValueError("At least one f needs to be provided")
    if before_f is None and after_f == "same":
        raise ValueError(":before-f must be a f with :after-f :same")

    def middleware(f: Callable[[Step, Opts], Opts], step: Step, opts: Opts) -> Opts:
        if before_f is not None:
            before_f(step, opts)
        result = f(step, opts)
        resolved_after = before_f if after_f == "same" else after_f
        if resolved_after is not None:
            resolved_after(step, result)
        return result

    return middleware


# Compatibility aliases available with getattr.
globals()["->workflow"] = workflow
globals()["->step-fn"] = step_fn
