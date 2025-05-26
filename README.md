<h1 align=center><code>big-config</code></h1>

[![project chat](https://img.shields.io/badge/slack-join_chat-brightgreen.svg)](https://clojurians.slack.com/archives/C08LGCKAK8C)

`big-config` adds a zero-cost `build` step to any `devops` tool like `terraform`, `k8s`, and `ansible`.

## YouTube demo
[![Watch the video](https://img.youtube.com/vi/8KR99_DAgRI/hqdefault.jpg)](https://www.youtube.com/watch?v=8KR99_DAgRI)


## Install
The core idea of `big-config` is that you should not write configuration files manually but you should have `build` step that generates them. [`deps-new`](https://github.com/seancorfield/deps-new) is used to create a `big-config` project.

``` shell
clojure -Sdeps '{:deps {io.github.amiorin/big-config {:git/sha "2c8d3be20790daed77ac57df763436b7eb76e120"}}}' \
    -Tnew create \
    :template amiorin/big-config \
    :name my-org/my-artifact \
    :target-dir my-project \
    :aws-account-id-dev 111111111111 \
    :aws-account-id-prod 222222222222 \
    :aws-profile default \
    :aws-region eu-west-1 \
    :overwrite :delete \
    && cd my-project && bb smoke-test
```

``` shell
cd my-project

# List all tasks
bb tasks

# How to create workflow in the cli
bb show-help

# List the files of module alpha profile prod
bb build exec -- alpha prod ls -l

# List the files of module beta profile prod
bb build exec -- beta prod ls -l

# List the files of module gamma profile prod
bb build exec -- gamma prod ls -l

# Run the tests, you need to have at least 2 commits
bb test:bb
```

## `big-config` and Tier 1 Workflow

### Core Problem

The primary problem `big-config` addresses is the significant repetition encountered when curating configuration files (e.g., for Terraform, Kubernetes, Ansible). This repetition arises from the need to express similar logic (such as importing data structures or iterating) within the specific configuration language of each tool.

### `big-config` Solution: A “Zero-Cost” Build Step

* **Concept:**
  `big-config` introduces a build step for configuration files, drawing inspiration from software-development workflows (e.g., JavaScript projects that compile TypeScript).

* **Process:**

  1. Users maintain configuration **source** files (often Clojure code) in a `src/` directory.
  2. A build step transforms these sources into **output** files in a `dist/` directory, using the syntax required by the target tool (Terraform, Kubernetes, etc.).

* **Benefits:**

  * **Reduced repetition:** Common logic is handled in Clojure rather than duplicated in each tool’s DSL.
  * **Abstraction:** Clojure can manipulate data structures, making configuration more dynamic and less verbose.
  * **Templating:** Two template engines are supported—`deps-new` (via `build.tools`) and **Selmer** (similar to Jinja)—to generate config dynamically.
  * **“Zero-Cost” ideal:** The build step aims to feel invisible, letting developers work as if editing the final files directly.

### Tier 1 Workflow Language

* **Purpose:**
  A small Domain-Specific Language (DSL) for composing command-line steps—an alternative to Makefiles.

* **Motivation:**
  Makefiles were found insufficient for dynamic workflows.

* **Key features:**

  * **CLI tool:** `babashka` provides commands to define and run workflows.
  * **Composed steps:**

    * `build` — run the `big-config` build step
    * `exec` — execute any command (e.g., `ansible-playbook`, `terraform plan`) inside `dist/`
    * `git-check` — verify the local branch isn’t behind `origin`
    * `git-push` — push changes
    * `lock` — acquire a pessimistic lock
    * `unlock-any` — release the lock
  * **Sequential execution:** Steps run in order; a failure stops the workflow.
  * **Integration with `big-config`:** The `build` step is fundamental, enabling a *change → build → run* loop.
  * **“Change and run” ideal:** Embedding the build step minimizes perceived overhead.

### Coordination and Locking

* **Problem:**
  Multiple developers modifying shared resources (e.g., an AWS account) need coordination to prevent conflicts. Tools like Atlantis handle this for Terraform.

* **`big-config` / Tier 1 solution:**

  * Uses **Git tags** as an exclusive locking primitive—generic across tools.
  * `lock` / `unlock-any` steps manage these locks within a workflow.
  * Provides a more general alternative to specialized services like Atlantis.

### Key Takeaways

* **`big-config`** adds a powerful abstraction layer by leveraging Clojure and a build step to reduce repetition and add dynamic logic.
* The **Tier 1 Workflow** language supplies a flexible CLI for defining and executing configuration workflows—integrating the `big-config` build step.
* Combined, they offer a generic Git-based coordination mechanism for shared resources, potentially replacing specialized tools such as Atlantis.
* The overall goal is to improve developer experience by simplifying both the creation and execution of complex infrastructure configurations.
* Compared to `atlantis`, `big-config` enables a faster `inner loop`. Only two accounts are needed, `prod` and `dev`. The `lock` step enables developers and CI to share the same AWS account for development and integration. Refactoring the code that generates the configuration files is trivial because the `dist` dir is committed and we can track with `git` any change made by mistake in it.
* Compared to `cdk`, `big-config` supports only `clojure` and `tofu`. The problem of generating `json` files should not be blown out of proportion.

## Tier-1 workflow language deep dive

The tier-1 workflow language is a simple DSL that allows developer to compose different steps into a workflow to make the `build` step a zero-cost operation. Other steps available in the tier-1 workflow language are:
* Acquire/release the lock
* Check if the working directory is clean and if we have pulled all commits from origin
* Push the changes inside a transaction

These primitives are necessary to enable multiple developers to work at the same time on the same infrastructure without any further coordination.

### Example

```
bb build lock git-check tofu:init tofu:apply:-auto-approve git-push unlock-any -- alpha prod
```

is a tier-1 workflow defined in the command line using `big-config` and invoked using `babashka`. The `build` step will use `deps-new` to generate the `alpha` module using the `prod` profile. The `lock` step will acquire a lock to make sure that we are the only one running (same capability of `atlantis`). The `git-check` step will make sure that our working directory is clean and not behind `origin`. The `tofu:init` step will run `tofu init` in the `target-dir`. The `tofu:apply:-auto-approve` step will run `tofu apply -auto-approve` in the `target-dir`. The `git-push` step will push our commits. The `unlock-any` step will release the lock.

### Manual
```
Usage: bb <step|cmd>+ -- <module> <profile> [global-args]

The available steps are listed below. Anything that is not a step is considered
a cmd where `:` is replaced with ` `

Steps
  build           use `deps-new` to generate the configuration files
  git-check       check if the working directory is clean and if have pulled all
                  commits from origin
  git-push        push your changes
  lock            acquire the lock
  unlock-any      release the lock from any owner
  exec            you can either multiple cmds or a single exec where the cmd
                  will be provided in the global-args

These two are equivalent
  bb exec -- alpha prod ansible-playbook main.yml
  bb ansible-playbook:main.yml -- alpha prod

These two are also equivalent
  bb tofu:apply tofu:destroy -- alpha prod -auto-approve
  bb tofu:apply:-auto-approve tofu:destroy:-auto-approve -- alpha prod

Example of cmds:
  tofu:init                    tofu init
  tofu:plan                    tofu plan
  tofu:applay:-auto-approve    tofu apply -auto-approve
  ansible-playbook:main.yml    ansible-playbook main.yml

```
