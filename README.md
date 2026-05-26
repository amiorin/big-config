<h1 align=center><code>BigConfig</code></h1>

**BigConfig is a Python workflow and template engine for infrastructure-as-code (IaC) automation.**

It provides a small map-threading workflow runtime, a Selmer-based renderer, a shell-command DSL, and Git-tag locking for tools such as OpenTofu/Terraform, Ansible, Kubectl, and other CLIs.

The repository is Python-only; the previous Clojure implementation, tests, templates, and Babashka/Clojure config have been removed.

## Status

Implemented in Python 3.12+:

- `big_config.core` — workflow primitives: `ok`, `choice`, `workflow`, `step_fn`
- `big_config.workflow` — high-level orchestration, CLI argument parsing, `run_steps`, `workflow_star`
- `big_config.pluggable` — pluggable step dispatch
- `big_config.render` — Selmer-powered template rendering
- `big_config.run` — shell command execution
- `big_config.git` — Git helper workflows
- `big_config.lock` / `big_config.unlock` — Git-tag pessimistic locking
- `big_config.utils` — shared helpers
- `big_config.selmer_filters` — BigConfig Selmer filters
- `big_config.step_fns` — workflow middleware helpers
- `big_tofu.core` / `big_tofu.create` — OpenTofu/Terraform construct helpers

Intentionally excluded from this rewrite for now:

- Redis store
- system lifecycle engine
- tools/template scaffolding CLI
- legacy `step` and `build` namespaces
- bundled template scaffolding

## Requirements

- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/)

The Selmer dependency is pinned in `pyproject.toml` to commit `d6db31695ba1c06abefe30d6ed8a1dedc0de110a` from `bigconfig-ai/Selmer`.

## Development

```shell
uv sync
uv run pytest -q
```

Current test suite:

```shell
31 passed
```

## CLI

The Python package exposes a `big-config` command with the same CLI DSL shape:

```shell
uv run big-config render lock tofu:init tofu:plan -- tofu apply -auto-approve
```

Rules:

- known tokens such as `render`, `lock`, `validate`, `describe`, and `unlock-any` become workflow steps
- `tool:subcommand` becomes the shell command `tool subcommand`
- `--` appends the rest of the command line as one raw command string
- shell commands run through the `exec` step

Minimal smoke test:

```shell
uv run big-config render -- true
```

## Python API

BigConfig keeps the original map-threading API model closely: workflows thread an `opts` dictionary through functions. Namespaced keys are represented as strings, for example `"big-config/exit"`.

```python
from big_config import ENV, EXIT
from big_config import workflow, render, run

opts = {
    ENV: "lib",
    workflow.STEPS: ["render", "exec"],
    render.TEMPLATES: [],
    run.CMDS: ["true"],
}

result = workflow.run_steps([], opts)
assert result[EXIT] == 0
```

### Defining a workflow

```python
from big_config import core

START = "example/start"
END = "example/end"


def prepare(opts):
    return core.ok({**opts, "prepared": True})


def wire(step, _step_fns):
    if step == START:
        return prepare, END
    return lambda opts: opts, None

wf = core.workflow({"first_step": START, "wire_fn": wire})
result = wf([], {})
```

### Pluggable steps

```python
from big_config import core, pluggable


@pluggable.defmethod("example/custom")
def custom_handler(f, step, step_fns, opts):
    return {**core.ok(opts), "custom": True}
```

To make a new unqualified CLI token parse as a workflow step:

```python
from big_config import workflow

workflow.PARSE_ARGS_STEPS.add("custom")
```

## Rendering

`big_config.render` uses the Python Selmer dependency pinned in `pyproject.toml`.

```python
from big_config import render

render.render({
    render.TEMPLATES: [{
        "template": "template",
        "target-dir": "dist",
        "overwrite": True,
        "transform": [["."]],
    }]
})
```

Template directories are resolved from the current working directory, `env/test/resources`, `test/resources`, and `resources` when those directories exist.

## Configuration Overrides

Parameters can be overridden from the environment with the `BC_PAR_` prefix:

```shell
export BC_PAR_PROVIDER_BACKEND="local"
```

```python
from big_config import workflow

opts = workflow.read_bc_pars({})
# {"big-config.workflow/params": {"provider-backend": "local"}}
```

## CI

GitHub Actions runs the Python suite with `uv` and Python 3.12. Dependencies are installed from `uv.lock`, including the pinned Selmer commit:

```shell
uv sync --frozen
uv run pytest -q
```

## Documentation & Resources

- Historical/manual site: <https://www.bigconfig.ai/manual/>
- Python source: [`src/big_config`](./src/big_config)
- BigTofu source: [`src/big_tofu`](./src/big_tofu)
- Tests: [`test`](./test)

---
Developed and maintained by [Alberto Miorin](https://albertomiorin.com).
