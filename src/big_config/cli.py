from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from . import ENV, EXIT
from .utils import requiring_resolve
from .workflow import parse_args, run_steps


def _load_opts(path: str | None) -> dict[str, Any]:
    if not path:
        return {}
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run a BigConfig workflow DSL")
    parser.add_argument("--opts-json", help="JSON file containing initial opts")
    parser.add_argument("--workflow", help="Workflow function as module.attr or module/attr; called with ([], opts)")
    parser.add_argument("args", nargs=argparse.REMAINDER, help="workflow steps and commands, e.g. render tofu:init -- tofu apply")
    ns = parser.parse_args(argv)
    opts = {ENV: "shell", **_load_opts(ns.opts_json), **parse_args(ns.args)}
    if "big-config.render/templates" not in opts:
        opts.setdefault("big-config.render/templates", [])
    if ns.workflow:
        wf = requiring_resolve(ns.workflow)
        result = wf([], opts)
    else:
        result = run_steps([], opts)
    exit_code = result.get(EXIT, 0)
    return int(exit_code) if isinstance(exit_code, int) else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
