# BigConfig — AI Assistant Guide

## Project Overview

This directory is the **Python 3.12+** implementation of BigConfig — a workflow and template engine for infrastructure-as-code automation. It keeps the original map-threading workflow model while using Python modules, pytest, uv, and the Python Selmer port pinned in `pyproject.toml`/`uv.lock` (`selmer @ git+https://github.com/bigconfig-ai/Selmer.git@<sha>`).

The Clojure sibling lives at `../clojure` and the TypeScript sibling at `../typescript`; they are parallel implementations of the same engine and must stay behaviour-equivalent (reserved keys, step semantics, CLI shape).

## Repository Layout

```text
big-config/python/
├── src/big_config/     # Python BigConfig package
├── src/big_tofu/       # Python OpenTofu/Terraform helpers
├── test/big_config/    # pytest suite for BigConfig
├── test/big_tofu/      # pytest suite for BigTofu
├── test/fixtures/      # Renderer fixtures used by pytest
├── env/test/resources/ # Renderer test resources
├── .github/workflows/  # Python CI
├── pyproject.toml      # Python package metadata and uv config
├── uv.lock             # Locked Python dependencies
├── devenv.nix          # Optional Nix/dev env
└── README.md           # User-facing docs
```

## Python Modules

| Module | Purpose |
|---|---|
| `big_config.core` | Workflow primitives: `ok`, `choice`, `workflow`, `step_fn` |
| `big_config.workflow` | High-level orchestration, CLI argument parsing, `run_steps`, `workflow_star` |
| `big_config.pluggable` | Pluggable step dispatch |
| `big_config.render` | Selmer-based renderer |
| `big_config.run` | Shell command execution |
| `big_config.git` | Git helper workflows |
| `big_config.lock` | Git-tag pessimistic locking |
| `big_config.unlock` | Force-release locking workflow |
| `big_config.utils` | Shared helpers and structured exceptions |
| `big_config.selmer_filters` | BigConfig Selmer filters |
| `big_config.step_fns` | Workflow middleware helpers |
| `big_config.cli` | CLI entry point (`uv run big-config ...`) |
| `big_config` (`__init__`) | Reserved-key string constants (`EXIT`, `ERR`, `STACK_TRACE`, `ENV`, `PROCS`, `STEPS`, `TEST_MODE`) |
| `big_tofu.core` | Construct helpers and references |
| `big_tofu.create` | Common OpenTofu/Terraform constructs |

## Development

Use uv:

```shell
uv sync
uv run pytest -q
```

The Selmer dependency is pinned to a Git commit in `pyproject.toml` and locked in `uv.lock`.

## Workflow Model

Workflows thread an `opts` dictionary through functions. Reserved keys are strings such as:

| Key | Meaning |
|---|---|
| `big-config/exit` | Exit code; `0` means success |
| `big-config/err` | Error text |
| `big-config/stack-trace` | Exception stack trace |

Minimal step:

```python
from big_config import core


def my_step(opts):
    return core.ok(opts)
```

Minimal workflow:

```python
from big_config import core

START = "example/start"
END = "example/end"


def wire(step, _step_fns):
    if step == START:
        return core.ok, END
    return lambda opts: opts, None

wf = core.workflow({"first_step": START, "wire_fn": wire})
result = wf([], {})
```

## CLI DSL

The Python CLI keeps the original DSL shape:

```shell
uv run big-config render lock tofu:init -- tofu apply -auto-approve
```

Parsing rules:

- known step names are collected in `big_config.workflow.PARSE_ARGS_STEPS`
- `tool:subcommand` becomes `tool subcommand`
- `--` appends the remaining tokens as one raw command string
- commands run through the `exec` step

## What to Avoid

- Do not add Clojure source, Clojure tests, Babashka tasks, or Clojure-specific config into this leaf; the Clojure implementation lives at `../clojure`.
- Do not create feature branches; stay on `python` (each language has its own branch in this repo).
- Do not commit unless explicitly asked. Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `deps:`).
- Do not vendor the Selmer dependency; keep it as the configured pinned Git dependency.
- Do not diverge from the Clojure / TypeScript siblings on reserved-key strings or CLI shape — keep `big-config/exit`, `big-config/err`, etc. verbatim across all three implementations.

## Useful Commands

```shell
uv sync --frozen
uv run pytest -q
uv run big-config --help
```
