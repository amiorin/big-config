from __future__ import annotations

import os
import shlex
import subprocess
from collections.abc import Mapping, Sequence
from typing import Any

from . import ERR, EXIT, PROCS
from .core import ok, workflow
from .utils import strip_ansi

SHELL_OPTS = "big-config.run/shell-opts"
CMDS = "big-config.run/cmds"
DIR = "big-config.run/dir"
RUN_CMD = "big-config.run/run-cmd"


def handle_cmd(opts: Mapping[str, Any], proc: Mapping[str, Any]) -> dict[str, Any]:
    res = {k: proc.get(k) for k in ["exit", "out", "err", "cmd"] if k in proc}
    for key, value in list(res.items()):
        if isinstance(value, str):
            res[key] = strip_ansi(value)
    new_opts = dict(opts)
    new_opts[PROCS] = [*new_opts.get(PROCS, []), res]
    if "exit" in res:
        new_opts[EXIT] = res["exit"]
    if "err" in res:
        new_opts[ERR] = res["err"]
    return new_opts


def _argv(cmd: str | Sequence[str]) -> list[str]:
    if isinstance(cmd, str):
        return shlex.split(cmd)
    return [str(x) for x in cmd]


def default_runner(shell_opts: Mapping[str, Any] | None, cmd: str | Sequence[str] | None) -> dict[str, Any]:
    shell_opts = dict(shell_opts or {})
    if cmd is None:
        return {"exit": 0, "out": "", "err": "", "cmd": None}
    argv = _argv(cmd)
    env = os.environ.copy()
    env.update(shell_opts.get("extra-env", shell_opts.get("extra_env", {})) or {})
    capture_out = shell_opts.get("out") == "string"
    capture_err = shell_opts.get("err") == "string"
    stdin = shell_opts.get("in")
    proc = subprocess.run(
        argv,
        input=stdin,
        text=True,
        cwd=shell_opts.get("dir"),
        env=env,
        stdout=subprocess.PIPE if capture_out else None,
        stderr=subprocess.PIPE if capture_err else None,
        check=False,
    )
    return {
        "exit": proc.returncode,
        "out": proc.stdout if capture_out and proc.stdout is not None else "",
        "err": proc.stderr if capture_err and proc.stderr is not None else "",
        "cmd": argv,
    }


runner = default_runner


def generic_cmd(*, opts: Mapping[str, Any], cmd: str | Sequence[str], key: str | None = None, shell_opts: Mapping[str, Any] | None = None) -> dict[str, Any]:
    resolved_shell_opts = {"continue": True, "out": "string", "err": "string"}
    resolved_shell_opts.update(dict(shell_opts or {}))
    proc = runner(resolved_shell_opts, cmd)
    new_opts = handle_cmd(opts, proc)
    if key is not None:
        new_opts[key] = str(proc.get("out", "")).removesuffix("\n")
    return new_opts


def mktemp_create_dir(opts: Mapping[str, Any]) -> dict[str, Any]:
    new_opts = generic_cmd(opts=opts, cmd="bash -c 'readlink -f $(mktemp -d)'", key=DIR)
    return {**new_opts, SHELL_OPTS: {**new_opts.get(SHELL_OPTS, {}), "dir": new_opts[DIR]}}


def mktemp_remove_dir(opts: Mapping[str, Any]) -> dict[str, Any]:
    return generic_cmd(opts=opts, cmd=["rm", "-rf", opts[DIR]])


def run_cmd(opts: Mapping[str, Any]) -> dict[str, Any]:
    shell_opts = {**opts.get(SHELL_OPTS, {}), "continue": True}
    env = opts.get("big-config/env")
    if env == "lib":
        shell_opts = {"out": "string", "err": "string", **shell_opts}
    else:
        shell_opts = {"out": "inherit", "err": "inherit", **shell_opts}
    cmds = list(opts.get(CMDS, []))
    cmd = cmds[0] if cmds else None
    proc = runner(shell_opts, cmd)
    return handle_cmd(opts, proc)


def push_nil(opts: Mapping[str, Any]) -> dict[str, Any]:
    cmds = list(opts.get(CMDS, []))
    return ok({**opts, CMDS: [None, *cmds] if cmds else [None]})


def _wire(step: str, _step_fns: list[Any]):
    if step == "big-config.run/start":
        return push_nil, "big-config.run/run-cmd"
    if step == "big-config.run/run-cmd":
        return run_cmd, "big-config.run/run-cmd"
    return lambda x: x, None


def _next(step: str, _next_step: str | None, opts: dict[str, Any]):
    cmds = list(opts.get(CMDS, []))
    exit_code = opts.get(EXIT)
    if len(cmds[1:]) > 0 and (exit_code == 0 or exit_code is None):
        new_opts = dict(opts)
        new_opts[CMDS] = cmds[1:]
        return "big-config.run/run-cmd", new_opts
    if step == "big-config.run/end":
        return None, opts
    return "big-config.run/end", opts


run_cmds = workflow({"first_step": "big-config.run/start", "wire_fn": _wire, "next_fn": _next})
