from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any

from . import core

Handler = Callable[[Callable[[dict[str, Any]], dict[str, Any]], str, list[Callable[..., Any]], dict[str, Any]], dict[str, Any]]
_methods: dict[str, Handler] = {}


def default_handle_step(f: Callable[[dict[str, Any]], dict[str, Any]], _step: str, _step_fns: list[Callable[..., Any]], opts: dict[str, Any]) -> dict[str, Any]:
    return f(opts)


def handle_step(f: Callable[[dict[str, Any]], dict[str, Any]], step: str, step_fns: list[Callable[..., Any]], opts: dict[str, Any]) -> dict[str, Any]:
    return _methods.get(step, default_handle_step)(f, step, step_fns, opts)


def defmethod(step: str, fn: Handler | None = None):
    """Register a step handler. Can be used directly or as a decorator."""

    def install(handler: Handler) -> Handler:
        _methods[step] = handler
        return handler

    return install(fn) if fn is not None else install


def remove_method(step: str) -> None:
    _methods.pop(step, None)


def workflow_star(wf_opts: Mapping[str, Any]) -> Callable[[list[Any], dict[str, Any]], dict[str, Any]]:
    """Pluggable variant of :func:`big_config.core.workflow`."""

    first_step = wf_opts["first_step"] if "first_step" in wf_opts else wf_opts.get("first-step")
    last_step = wf_opts.get("last_step", wf_opts.get("last-step"))
    wire_fn = wf_opts["wire_fn"] if "wire_fn" in wf_opts else wf_opts.get("wire-fn")
    next_fn = wf_opts.get("next_fn", wf_opts.get("next-fn"))

    def run(step_fns: list[Any], opts: dict[str, Any]) -> dict[str, Any]:
        def new_wire_fn(step: str, resolved_step_fns: list[Callable[..., Any]]):
            f, next_step = core._normalize_wire_result(wire_fn(step, resolved_step_fns))

            def wrapped(inner_opts: dict[str, Any]) -> dict[str, Any]:
                return handle_step(f, step, resolved_step_fns, inner_opts)

            return wrapped, next_step

        wf = core.workflow(
            {
                "first_step": first_step,
                "last_step": last_step,
                "wire_fn": new_wire_fn,
                "next_fn": next_fn,
            }
        )
        return wf(step_fns, opts)

    return run


# Compatibility alias.
globals()["->workflow*"] = workflow_star
