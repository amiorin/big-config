# BigConfig Clojure SDK — AI Assistant Guide

## Project Overview

This directory is the Clojure SDK: the JVM implementation of BigConfig SDK. It provides workflow orchestration, Selmer template rendering, shell command execution, Git locking helpers, and BigTofu/OpenTofu construct helpers.

The project uses `deps.edn`, `clojure.test`, and the Selmer template library (Maven artifact `selmer/selmer {:mvn/version "1.13.1"}`).

## Repository Layout

```text
big-config/clojure/
├── src/
│   ├── big_config.clj         # Aggregator namespace
│   └── big_config/            # Clojure source (cli, core, workflow, render, run, lock, …)
│       └── big_tofu/          # OpenTofu/Terraform helpers
├── test/big_config/           # clojure.test tests, plus test_runner.clj
└── deps.edn
```

## Namespaces

| Namespace | Purpose |
|---|---|
| `big-config.core` | Workflow primitives: `ok`, `choice`, `workflow`, `step-fn` |
| `big-config.workflow` | High-level orchestration, CLI argument parsing, `run-steps`, `create-workflow-star` |
| `big-config.pluggable` | Pluggable step dispatch |
| `big-config.render` | Selmer-based renderer |
| `big-config.run` | Shell command execution |
| `big-config.git` | Git helper workflows |
| `big-config.lock` | Git-tag pessimistic locking |
| `big-config.unlock` | Force-release locking workflow |
| `big-config.utils` | Shared helpers and structured exceptions |
| `big-config.keys` | Namespaced reserved-key registry |
| `big-config.selmer-filters` | SDK Selmer filters |
| `big-config.step-fns` | Workflow middleware helpers |
| `big-config.cli` | CLI entry point (`-M:run`) |
| `big-config.big-tofu.core` | Construct helpers and references |
| `big-config.big-tofu.create` | Common OpenTofu/Terraform constructs |
| `big-config` | Aggregator namespace (re-exports all of the above) |

## Development Commands

```sh
clojure -M:test
clojure -M:run -- echo ok
```

## Code Conventions

- JVM Clojure only.
- Use namespaced option keys such as `:big-config/exit` and `:big-config.workflow/steps`.
- Keep command execution behind the `big-config.run/runner` seam so tests can avoid spawning real processes.
- Keep subworkflow isolation in `big-config.workflow/run-steps` and `big-config.workflow/create-workflow-star`.
- Do not add project scaffolding, store, system lifecycle, or build-helper modules unless explicitly requested.

## Git

Stay on `clojure` (each language has its own branch in this repo). Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `deps:`). Commit only when explicitly asked.
