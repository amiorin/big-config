from __future__ import annotations

import sys
import tempfile
from typing import Any, Callable

from selmer import render as selmer_render

from . import ENV, ERR, EXIT, STACK_TRACE, STEPS
from .core import step_fn


def exit_with_code(n: int | None) -> None:
    sys.exit(0 if n is None else int(n))


def exit_step_fn(end: str):
    return step_fn(
        {
            "after_f": lambda step, opts: exit_with_code(opts.get(EXIT))
            if step == end and opts.get(ENV) != "repl"
            else None
        }
    )


def print_error_step_fn(end: str):
    def before(step: str, opts: dict[str, Any]) -> None:
        exit_code = opts.get(EXIT, 0)
        err = opts.get(ERR)
        stack_trace = opts.get(STACK_TRACE)
        if step == end and isinstance(exit_code, int) and exit_code > 0 and isinstance(err, str) and err.strip():
            print(f"✘ {err}", file=sys.stderr)
        if step == end and isinstance(exit_code, int) and exit_code > 0 and isinstance(stack_trace, str) and stack_trace.strip():
            with tempfile.NamedTemporaryFile("w", prefix="big-config-", suffix=".txt", dir="/tmp", delete=False) as handle:
                handle.write(stack_trace)
            print(f"\nThe stack-trace has been written to {handle.name}", file=sys.stderr)

    return step_fn({"before_f": before})


def _tap(label: str, step: str, opts: dict[str, Any]) -> None:
    # Python has no tap> equivalent here; keep a hook-friendly no-op.
    return None


tap_step_fn = step_fn({"before_f": lambda step, opts: _tap("before", step, opts), "after_f": lambda step, opts: _tap("after", step, opts)})


def log_step_fn(f: Callable[[str, dict[str, Any]], dict[str, Any]], step: str, opts: dict[str, Any]) -> dict[str, Any]:
    new_opts = dict(opts)
    new_opts[STEPS] = [*new_opts.get(STEPS, []), step]
    return f(step, new_opts)


def bling_step_fn(f: Callable[[str, dict[str, Any]], dict[str, Any]], step: str, opts: dict[str, Any]) -> dict[str, Any]:
    print(selmer_render("{{ prefix }} {{ msg }}", {"prefix": "→", "msg": str(step)}), file=sys.stderr)
    result = f(step, opts)
    if result.get(EXIT, 0) > 0:
        print(selmer_render("{{ prefix }} {{ msg }}: {{ err }}", {"prefix": "✘", "msg": str(step), "err": result.get(ERR)}), file=sys.stderr)
    return result


# Compatibility aliases.
globals()["->exit-step-fn"] = exit_step_fn
globals()["->print-error-step-fn"] = print_error_step_fn
