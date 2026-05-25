from __future__ import annotations

import hashlib
import os
import sys
from collections.abc import Callable, Iterable, Mapping, Sequence
from typing import Any

from . import ENV, ERR, EXIT
from . import core
from . import git, lock, pluggable, render, run, unlock
from .utils import BigConfigError, has_namespace, keyword, keyword_to_name, keyword_to_path, name, namespace, requiring_resolve, to_fn

STEPS = "big-config.workflow/steps"
CREATE_FN = "big-config.workflow/create-fn"
BUILD_FN = "big-config.workflow/build-fn"
DELETE_FN = "big-config.workflow/delete-fn"
VALIDATE_FN = "big-config.workflow/validate-fn"
DESCRIBE_FN = "big-config.workflow/describe-fn"
CREATE_OPTS = "big-config.workflow/create-opts"
BUILD_OPTS = "big-config.workflow/build-opts"
DELETE_OPTS = "big-config.workflow/delete-opts"
NAME = "big-config.workflow/name"
PATH_FN = "big-config.workflow/path-fn"
OBJECT_FN = "big-config.workflow/object-fn"
PREFIX = "big-config.workflow/prefix"
OBJECT_PREFIX = "big-config.workflow/object-prefix"
PARAMS = "big-config.workflow/params"
GLOBALS = "big-config.workflow/globals"

PARSE_ARGS_STEPS: set[str] = {"lock", "git-check", "render", "create", "build", "delete", "validate", "describe", "exec", "git-push", "unlock-any"}
_WORKFLOW_REGISTRY: dict[str, Callable[[list[Any], dict[str, Any]], dict[str, Any]]] = {}


def _print_step_before(step: str, opts: Mapping[str, Any]) -> None:
    failed = opts.get(EXIT) is not None and opts.get(EXIT) != 0
    prefix = "✖" if failed else "➜"
    msg = None
    if step == "big-config.workflow/lock":
        msg = f"Lock (owner {opts.get('big-config.lock/owner', '')})"
    elif step == "big-config.workflow/unlock-any":
        msg = "Unlock any"
    elif step == "big-config.workflow/git-check":
        msg = "Checking if the working directory is clean"
    elif step == "big-config.workflow/render":
        msg = f"Rendering workflow: {opts.get(NAME, '')}"
    elif step == "big-config.run/run-cmd":
        msg = f"Running:\n> {(opts.get(run.CMDS) or [''])[0] or ''}"
    if msg:
        print(f"{prefix} {msg}", file=sys.stderr)


def _print_step_after(step: str, opts: Mapping[str, Any]) -> None:
    if opts.get(EXIT, 0) > 0 and step in {"big-config.workflow/git-check", "big-config.run/run-cmd"}:
        msg = "Working directory is NOT clean" if step == "big-config.workflow/git-check" else f"Failed running:\n> {(opts.get(run.CMDS) or [''])[0] or ''}"
        print(f"✖ {msg}", file=sys.stderr)


print_step_fn = core.step_fn({"before_f": _print_step_before, "after_f": _print_step_after})


def register_workflow_step(step: str, fn: Callable[[list[Any], dict[str, Any]], dict[str, Any]]) -> None:
    _WORKFLOW_REGISTRY[step] = fn


def unregister_workflow_step(step: str) -> None:
    _WORKFLOW_REGISTRY.pop(step, None)


def _resolve_fn(key: str, opts: Mapping[str, Any], default: Any = None, required: bool = True) -> Callable[..., Any]:
    value = opts.get(key)
    if value is None:
        if required and default is None:
            raise BigConfigError(f"`{key}` not defined", opts)
        return default
    return to_fn(value)


def select_globals(opts: Mapping[str, Any]) -> dict[str, Any]:
    selected = opts.get("globals")
    keys = selected or [ENV, run.SHELL_OPTS, render.MODULE, render.PROFILE, PREFIX, OBJECT_PREFIX, GLOBALS]
    return {k: opts[k] for k in keys if k in opts}


def _qualify_workflow_step(step: str) -> str:
    step = str(step).lstrip(":")
    return step if has_namespace(step) else keyword("big-config.workflow", step)


def _hook_or_ok(key: str, opts: Mapping[str, Any]) -> Callable[[list[Any], dict[str, Any]], dict[str, Any]]:
    value = opts.get(key)
    if value is None:
        return lambda _step_fns, hook_opts: core.ok(hook_opts)
    return to_fn(value)


def run_steps(step_fns: list[Any], opts: Mapping[str, Any]) -> dict[str, Any]:
    globals_opts = select_globals(opts)
    create_opts = {**dict(opts.get(CREATE_OPTS, {}) or {}), **globals_opts}
    build_opts = {**dict(opts.get(BUILD_OPTS, {}) or {}), **globals_opts}
    delete_opts = {**dict(opts.get(DELETE_OPTS, {}) or {}), **globals_opts}
    opts_acc: dict[str, Any] = dict(opts)
    steps_queue = [_qualify_workflow_step(step) for step in opts.get(STEPS, [])]

    def wire_fn(step: str, resolved_step_fns: list[Callable[..., Any]]):
        if step == "big-config.workflow/start":
            return core.ok, None
        if step == "big-config.workflow/lock":
            return lambda inner: lock.lock(resolved_step_fns, inner), None
        if step == "big-config.workflow/git-check":
            return lambda inner: git.check(resolved_step_fns, inner), None
        if step == "big-config.workflow/render":
            return lambda inner: render.templates(resolved_step_fns, inner), None
        if step == "big-config.workflow/create":
            return lambda inner: _resolve_fn(CREATE_FN, opts)(resolved_step_fns, inner), None
        if step == "big-config.workflow/build":
            return lambda inner: _resolve_fn(BUILD_FN, opts)(resolved_step_fns, inner), None
        if step == "big-config.workflow/delete":
            return lambda inner: _resolve_fn(DELETE_FN, opts)(resolved_step_fns, inner), None
        if step == "big-config.workflow/validate":
            return lambda inner: _hook_or_ok(VALIDATE_FN, opts)(resolved_step_fns, inner), None
        if step == "big-config.workflow/describe":
            return lambda inner: _hook_or_ok(DESCRIBE_FN, opts)(resolved_step_fns, inner), None
        if step == "big-config.workflow/exec":
            return lambda inner: run.run_cmds(resolved_step_fns, inner), None
        if step == "big-config.workflow/git-push":
            return git.git_push, None
        if step == "big-config.workflow/unlock-any":
            return lambda inner: unlock.unlock_any(resolved_step_fns, inner), None
        return lambda x: x, None

    def next_fn(step: str, _next_step: str | None, current_opts: dict[str, Any]):
        nonlocal opts_acc, steps_queue
        exit_code = current_opts.get(EXIT)
        if step in {"big-config.workflow/create", "big-config.workflow/build", "big-config.workflow/delete"}:
            opts_acc.update({k: current_opts.get(k) for k in [EXIT, ERR] if k in current_opts})
            opts_acc.setdefault(step, []).append(current_opts)
        else:
            opts_acc = current_opts
        if step == "big-config.workflow/end":
            return None, opts_acc
        if isinstance(exit_code, int) and exit_code > 0:
            return "big-config.workflow/end", opts_acc
        if steps_queue:
            next_step = steps_queue.pop(0)
            if next_step == "big-config.workflow/create":
                return next_step, dict(create_opts)
            if next_step == "big-config.workflow/build":
                return next_step, dict(build_opts)
            if next_step == "big-config.workflow/delete":
                return next_step, dict(delete_opts)
            return next_step, opts_acc
        return "big-config.workflow/end", opts_acc

    wf = pluggable.workflow_star(
        {
            "first_step": "big-config.workflow/start",
            "last_step": "big-config.workflow/end",
            "wire_fn": wire_fn,
            "next_fn": next_fn,
        }
    )
    return wf(step_fns, opts_acc)


def parse_args(str_or_args: str | Sequence[str]) -> dict[str, Any]:
    xs: list[str]
    if isinstance(str_or_args, str):
        stripped = str_or_args.strip()
        xs = stripped.split() if stripped else []
    else:
        xs = [str(x) for x in str_or_args]
    token = xs.pop(0) if xs else None
    steps: list[str] = []
    cmds: list[str] = []
    while token is not None:
        if token in {"--"}:
            if not xs:
                raise BigConfigError("-- cannot be without a command", {})
            if "exec" not in steps:
                steps.append("exec")
            cmds.append(" ".join(xs))
            xs = []
            token = None
        elif token in PARSE_ARGS_STEPS:
            steps.append(token)
            token = xs.pop(0) if xs else None
        else:
            if "exec" not in steps:
                steps.append("exec")
            cmds.append(token.replace(":", " "))
            token = xs.pop(0) if xs else None
    return {STEPS: steps, run.CMDS: cmds}


def _add_suffix(kw: str, suffix: str) -> str:
    return keyword(namespace(kw), name(kw) + suffix)


def _parse_path(path: str) -> list[str]:
    return str(path).split("/")


def _build_path(parts: Iterable[str], profile: str, suffix: str) -> str:
    return "/".join([*list(parts), f"{profile}-{suffix}"])


def new_prefix(opts: Mapping[str, Any], first_step: str) -> dict[str, Any]:
    prefix = str(opts.get(PREFIX, ".dist"))
    object_prefix = str(opts.get(OBJECT_PREFIX, "tofu"))
    profile = str(opts.get(render.PROFILE, "default"))
    dirs = _parse_path(prefix)
    object_dirs = _parse_path(object_prefix)
    profile_found = bool(dirs and dirs[-1].startswith(profile))
    prev_hash = dirs[-1].split("-")[-1] if profile_found else ""
    base_dirs = dirs[:-1] if profile_found else dirs
    base_object_dirs = object_dirs[:-1] if profile_found else object_dirs
    digest = hashlib.sha256(f"{first_step}{prev_hash}".encode()).hexdigest()[:8]
    new_opts = dict(opts)
    new_opts[PREFIX] = _build_path(base_dirs, profile, digest)
    new_opts[OBJECT_PREFIX] = _build_path(base_object_dirs, profile, digest)
    return new_opts


def _pipeline_pairs(pipeline: Sequence[Any]) -> list[tuple[str, Sequence[Any]]]:
    if len(pipeline) % 2 != 0:
        raise ValueError(":pipeline must contain alternating step and [args opts_fn] entries")
    return [(str(pipeline[i]).lstrip(":"), pipeline[i + 1]) for i in range(0, len(pipeline), 2)]


def _resolve_pipeline_fn(step: str, step_fns: list[Any]) -> Callable[[dict[str, Any]], dict[str, Any]]:
    if step in _WORKFLOW_REGISTRY:
        return lambda opts: _WORKFLOW_REGISTRY[step](step_fns, opts)
    ns = namespace(step)
    nm = name(step).replace("-", "_")
    if ns is None:
        raise BigConfigError("Pipeline step must be qualified", {"step": step})
    fn = requiring_resolve(f"{ns}/{nm}")
    return lambda opts: fn(step_fns, opts)


def workflow_star(wf_opts: Mapping[str, Any]) -> Callable[[list[Any], Mapping[str, Any]], dict[str, Any]]:
    pipeline = wf_opts.get("pipeline")
    if not isinstance(pipeline, Sequence) or isinstance(pipeline, (str, bytes, bytearray, Mapping)):
        raise ValueError(":pipeline must be like [::tool/tofu ...\n::tool/ansible ...")
    first_step = str(wf_opts.get("first_step", wf_opts.get("first-step"))).lstrip(":")
    last_step0 = wf_opts.get("last_step", wf_opts.get("last-step"))
    last_step = str(last_step0).lstrip(":") if last_step0 else keyword(namespace(first_step), "end")
    pairs = _pipeline_pairs(pipeline)

    def run_wf(step_fns: list[Any], opts0: Mapping[str, Any]) -> dict[str, Any]:
        globals_opts = new_prefix(select_globals(opts0), first_step)
        step_to_opts_and_opts_fn: dict[str, tuple[dict[str, Any], Callable[[dict[str, Any]], dict[str, Any]]]] = {}
        for step, args_and_maybe_fn in pairs:
            args_list = list(args_and_maybe_fn)
            args = args_list[0] if args_list else []
            opts_fn = to_fn(args_list[1], lambda x: x) if len(args_list) > 1 else (lambda x: x)
            step_opts = dict(opts0.get(_add_suffix(step, "-opts"), {}) or {})
            step_args = parse_args(args)
            step_to_opts_and_opts_fn[step] = ({**step_args, **globals_opts, **step_opts}, opts_fn)

        sequence = [first_step, *[step for step, _ in pairs], last_step]
        step_to_f_and_next: dict[str, tuple[Callable[[dict[str, Any]], dict[str, Any]], str | None]] = {}
        for current, nxt in zip(sequence, [*sequence[1:], None]):
            if current == first_step:
                f = core.ok
            elif current == last_step:
                f = lambda x: x
            else:
                f = _resolve_pipeline_fn(current, step_fns)
            step_to_f_and_next[current] = (f, nxt)

        opts_acc: dict[str, Any] = dict(opts0)
        steps_set = {step for step, _ in pairs}

        def wire_fn(step: str, _resolved_step_fns: list[Callable[..., Any]]):
            return step_to_f_and_next[step]

        def next_fn(step: str, next_step: str | None, current_opts: dict[str, Any]):
            nonlocal opts_acc
            exit_code = current_opts.get(EXIT)
            if step in steps_set:
                opts_acc.update({k: current_opts.get(k) for k in [EXIT, ERR] if k in current_opts})
                opts_acc[step] = current_opts
            else:
                opts_acc = current_opts
            if step == last_step or next_step is None:
                return None, opts_acc
            if isinstance(exit_code, int) and exit_code > 0:
                return last_step, opts_acc
            new_opts, opts_fn = step_to_opts_and_opts_fn.get(next_step, (opts_acc, lambda x: x))
            return next_step, opts_fn(dict(new_opts))

        wf = pluggable.workflow_star({"first_step": first_step, "last_step": last_step, "wire_fn": wire_fn, "next_fn": next_fn})
        return wf(step_fns, dict(opts0))

    return run_wf


def path(opts: Mapping[str, Any], wf_name: str) -> str:
    return f"{opts.get(PREFIX, '.dist')}/{keyword_to_path(wf_name)}"


def prepare(opts: Mapping[str, Any], overrides: Mapping[str, Any]) -> dict[str, Any]:
    if opts.get(NAME) is None:
        raise ValueError("Argument name is nil")
    prefix = overrides.get(PREFIX)
    object_prefix = overrides.get(OBJECT_PREFIX)
    path_fn = overrides.get(PATH_FN) or (lambda current: f"{current.get(PREFIX, prefix or '.dist')}/{keyword_to_path(current[NAME])}")
    object_fn = overrides.get(OBJECT_FN) or (lambda current: f"{current.get(OBJECT_PREFIX, object_prefix or 'tofu')}/{keyword_to_name(current[NAME])}")
    merged = {**dict(opts), **dict(overrides)}
    target_dir = path_fn(merged)
    target_object = object_fn(merged)
    params = dict(overrides.get(PARAMS, {}) or {})
    templates = []
    for template in merged.get(render.TEMPLATES, []) or []:
        templates.append({**dict(template), **params, "target-dir": target_dir, "target-object": target_object})
    shell_opts = {**merged.get(run.SHELL_OPTS, {}), "dir": target_dir}
    return {**merged, render.TEMPLATES: templates, run.SHELL_OPTS: shell_opts}


def merge_params(tools: Sequence[str], params: Mapping[str, Any], opts: Mapping[str, Any]) -> dict[str, Any]:
    result = dict(opts)
    for tool in tools:
        for root in [CREATE_OPTS, BUILD_OPTS, DELETE_OPTS]:
            root_map = dict(result.get(root, {}) or {})
            tool_map = dict(root_map.get(tool, {}) or {})
            existing = dict(tool_map.get(PARAMS, {}) or {})
            tool_map[PARAMS] = {**dict(params), **existing}
            root_map[tool] = tool_map
            result[root] = root_map
    return result


def read_bc_pars(opts: Mapping[str, Any], env: Mapping[str, str] | None = None) -> dict[str, Any]:
    env = env or os.environ
    prefix = "BC_PAR_"
    params_from_env = {
        key[len(prefix) :].lower().replace("_", "-").replace(".", "-"): value
        for key, value in env.items()
        if key.startswith(prefix)
    }
    merged_params = {**dict(opts.get(PARAMS, {}) or {}), **params_from_env}
    return {**dict(opts), PARAMS: merged_params}


# Compatibility alias.
globals()["->workflow*"] = workflow_star
