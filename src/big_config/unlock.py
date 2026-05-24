from __future__ import annotations

from typing import Any

from .core import workflow
from .lock import check_remote_tag, delete_remote_tag, delete_tag, generate_lock_id


def _wire(step: str, _step_fns: list[Any]):
    if step == "big-config.unlock/generate-lock-id":
        return generate_lock_id, "big-config.unlock/delete-tag"
    if step == "big-config.unlock/delete-tag":
        return delete_tag, "big-config.unlock/delete-remote-tag"
    if step == "big-config.unlock/delete-remote-tag":
        return delete_remote_tag, "big-config.unlock/check-remote-tag"
    if step == "big-config.unlock/check-remote-tag":
        return check_remote_tag, "big-config.unlock/end"
    return lambda x: x, None


def _next(_step: str, next_step: str | None, opts: dict[str, Any]):
    return (next_step, opts) if next_step else (None, opts)


unlock_any = workflow({"first_step": "big-config.unlock/generate-lock-id", "wire_fn": _wire, "next_fn": _next})
