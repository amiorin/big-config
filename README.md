<h1 align=center><code>BigConfig</code></h1>

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/amiorin/big-config)

**BigConfig is a workflow and template engine that enables a "zero-cost build step" for infrastructure-as-code (IaC).**

It bridges the gap between powerful general-purpose programming (Clojure/Babashka) and specialized CLI tools like Terraform, OpenTofu, Ansible, Kubectl, and more.

## Why BigConfig?

Modern infrastructure automation often suffers from "scripting fatigue"—fragile Bash scripts or restrictive DSLs (HCL, YAML) that make complex logic hard to maintain. BigConfig provides:

- **Zero-Cost Build Step**: Use Clojure's expressive data manipulation to generate configuration files (JSON, YAML, HCL), then execute your tools seamlessly.
- **Functional Orchestration**: Sequence multiple tools into a unified lifecycle (e.g., `render` -> `lock` -> `tofu apply` -> `unlock`).
- **Serverless Locking**: A client-side, Git-based locking mechanism (using Git tags) to coordinate team efforts without a central coordination server like Atlantis.
- **Extreme Portability**: Develop and debug locally with a REPL, then run the exact same workflow in CI with absolute parity.

## Core Pillars

- **[Workflow](./src/clj/big_config/workflow.clj)**: A state-driven engine for composing automation units into complex pipelines. It supports **[pluggable steps](./src/clj/big_config/pluggable.clj)** via Clojure multimethods, allowing you to override or extend any standard behavior.
- **[Render](./src/clj/big_config/render.clj)**: A powerful template engine based on Selmer for generating tool configurations from project-agnostic templates.
- **[Lock](./src/clj/big_config/lock.clj)**: A "client-side Atlantis" that ensures safety in collaborative environments using Git as the backend.
- **[Store](./src/clj/big_config/store.clj)**: A Redis-backed journaling store for managing state with ACID-like properties. It enables event-sourcing and reliable state transitions in long-running workflows.
- **[System](./src/clj/big_config/system.clj)**: A lifecycle management alternative to Integrant that uses workflows to coordinate the start and stop of system components, with built-in support for background processes.

## Configuration Overrides

BigConfig supports overriding project parameters through environment variables using the `BC_PAR_` prefix. This is particularly useful for CI/CD pipelines:

```shell
# This overrides the :cloudflare-zone-id parameter
export BC_PAR_CLOUDFLARE_ZONE_ID="your-zone-id"
```

## Installation

BigConfig is typically used as a Clojure tool or via Babashka. For detailed instructions, visit the [Getting Started](https://www.big-config.it/start-here/getting-started/) guide.

```shell
# Add BigConfig as a tool to Clojure
clojure -Ttools install-latest :lib io.github.amiorin/big-config :as big-config

# Print help for all available templates
clojure -A:deps -Tbig-config help/doc

# Scaffold a new project using the package template
clojure -Tbig-config package :owner acme :repository infra :ssh-key 123456 :target-dir my-infra
```

## The BigConfig DSL (Babashka)

When used with Babashka, BigConfig provides a concise DSL for running workflows directly from the shell:

```shell
# Render configs, acquire a lock, run Tofu, and unlock—all in one command
bb render lock tofu:init tofu:apply -- alpha prod
```

- `render`: Generates configuration files.
- `lock`: Acquires a pessimistic lock via Git tags.
- `tofu:init`: Executes `tofu init` in the rendered directory.
- `unlock-any`: Force-releases the lock.
- `-- alpha prod`: Specifies the **module** and **profile**.

## Documentation & Resources

- **[Full Documentation](https://www.big-config.it/)**
- **[Getting Started Guide](https://www.big-config.it/start-here/getting-started/)**
- **[API Reference](https://www.big-config.it/api/core)**

---
Developed and maintained by [Alberto Miorin](https://albertomiorin.com).
