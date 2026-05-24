# BigConfig Clojure — AI Assistant Guide

## Project Overview

This directory is the JVM Clojure implementation of BigConfig. It provides workflow orchestration, Selmer template rendering, shell command execution, Git locking helpers, and BigTofu/OpenTofu construct helpers.

The project uses `deps.edn`, `clojure.test`, and the local Clojure Selmer checkout at `../../Selmer/master` (currently `/home/ubuntu/code/bigconfig/Selmer/master`).

## Repository Layout

```text
big-config/clojure/
├── src/big_config/          # Clojure source
│   ├── big_tofu/            # OpenTofu/Terraform helpers
│   ├── core.clj             # Workflow primitives
│   ├── workflow.clj         # Composition layer and CLI parsing
│   ├── render.clj           # Selmer template renderer
│   ├── run.clj              # Shell command execution
│   ├── lock.clj             # Git-tag locking
│   └── ...
├── test/big_config/         # clojure.test tests
└── deps.edn
```

## Development Commands

```sh
clojure -X:deps prep # prepares local Selmer when needed
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

Stay on `main`. Commit only when explicitly asked.
