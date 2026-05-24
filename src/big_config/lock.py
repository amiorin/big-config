from __future__ import annotations

import ast
import hashlib
import json
import re
from collections.abc import Mapping
from typing import Any

from . import ERR, EXIT
from .core import choice, workflow
from .run import generic_cmd
from .utils import sort_nested_map

OWNER = "big-config.lock/owner"
LOCK_KEYS = "big-config.lock/lock-keys"
LOCK_DETAILS = "big-config.lock/lock-details"
LOCK_NAME = "big-config.lock/lock-name"
TAG_CONTENT = "big-config.lock/tag-content"


def _stable_lock_hash(value: Any) -> str:
    payload = json.dumps(sort_nested_map(value), sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha1(payload.encode()).hexdigest()[:8].upper()


def generate_lock_id(opts: Mapping[str, Any]) -> dict[str, Any]:
    lock_keys = list(opts.get(LOCK_KEYS, []))
    lock_details = {k: opts.get(k) for k in lock_keys if k in opts}
    lock_name = f"LOCK-{_stable_lock_hash(lock_details)}"
    details_with_owner = dict(lock_details)
    details_with_owner[OWNER] = opts.get(OWNER)
    return {**opts, LOCK_DETAILS: details_with_owner, LOCK_NAME: lock_name, EXIT: 0, ERR: None}


def delete_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "tag", "-d", opts[LOCK_NAME]])


def create_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    lock_details = json.dumps(opts.get(LOCK_DETAILS, {}), sort_keys=True)
    return generic_cmd(
        opts=opts,
        shell_opts={"in": f">>>{lock_details}"},
        cmd=["git", "tag", "-a", opts[LOCK_NAME], "-F", "-"],
    )


def push_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "push", "origin", opts[LOCK_NAME]])


def delete_remote_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "push", "--delete", "origin", opts[LOCK_NAME]])


def get_remote_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "fetch", "origin", "tag", opts[LOCK_NAME], "--no-tags"])


def read_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["git", "cat-file", "-p", opts[LOCK_NAME]], key=TAG_CONTENT)


def _parse_simple_edn_map(s: str) -> dict[str, Any]:
    # Minimal support for legacy map payloads such as
    # {:big-config.lock/owner "CI"} and #:big-config.lock{:owner "CI"}.
    s = s.strip()
    if s.startswith("#:"):
        ns, rest = s[2:].split("{", 1)
        body = rest.rsplit("}", 1)[0]
        pairs = re.findall(r":([^\s]+)\s+" + r'"([^"]*)"', body)
        return {f"{ns}/{k}": v for k, v in pairs}
    pairs = re.findall(r":([^\s{}]+)\s+" + r'"([^"]*)"', s)
    return {k: v for k, v in pairs}


def parse_tag_content(tag_content: str) -> dict[str, Any]:
    line = next((line for line in str(tag_content).splitlines() if line.startswith(">>>")), "{}")
    payload = line.removeprefix(">>>")
    try:
        return json.loads(payload)
    except Exception:  # noqa: BLE001
        pass
    try:
        return ast.literal_eval(payload)
    except Exception:  # noqa: BLE001
        pass
    return _parse_simple_edn_map(payload)


def check_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    tag_details = parse_tag_content(str(opts.get(TAG_CONTENT, "")))
    ownership = all(opts.get(k) == v for k, v in tag_details.items())
    return {**opts, **({EXIT: 0, ERR: None} if ownership else {EXIT: 1, ERR: "Different owner"})}


def check_remote_tag(opts: Mapping[str, Any]) -> dict[str, Any]:
    new_opts = generic_cmd(opts=opts, cmd=["git", "ls-remote", "--exit-code", "origin", f"refs/tags/{opts[LOCK_NAME]}"])
    if new_opts.get(EXIT) == 2:
        return {**new_opts, EXIT: 0, ERR: None}
    return {**new_opts, EXIT: 1, ERR: new_opts.get(ERR)}


def _wire(step: str, _step_fns: list[Any]):
    if step == "big-config.lock/generate-lock-id":
        return generate_lock_id, "big-config.lock/delete-tag"
    if step == "big-config.lock/delete-tag":
        return delete_tag, "big-config.lock/create-tag"
    if step == "big-config.lock/create-tag":
        return create_tag, "big-config.lock/push-tag"
    if step == "big-config.lock/push-tag":
        return push_tag, "big-config.lock/get-remote-tag"
    if step == "big-config.lock/get-remote-tag":
        return lambda opts: get_remote_tag(delete_tag(opts)), "big-config.lock/read-tag"
    if step == "big-config.lock/read-tag":
        return read_tag, "big-config.lock/check-tag"
    if step == "big-config.lock/check-tag":
        return check_tag, "big-config.lock/end"
    return lambda x: x, None


def _next(step: str, next_step: str | None, opts: dict[str, Any]):
    if step == "big-config.lock/end":
        return None, opts
    if step == "big-config.lock/push-tag":
        return choice(on_success="big-config.lock/end", on_failure=next_step, opts=opts)
    if step == "big-config.lock/delete-tag":
        return next_step, opts
    return choice(on_success=next_step, on_failure="big-config.lock/end", opts=opts)


lock = workflow({"first_step": "big-config.lock/generate-lock-id", "wire_fn": _wire, "next_fn": _next})
