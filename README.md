<h1 align=center><code>big-config</code></h1>

[![project chat](https://img.shields.io/badge/slack-join_chat-brightgreen.svg)](https://clojurians.slack.com/archives/C08LGCKAK8C)

`big-config` introduces an efficient, automated `build` step for your DevOps tools (like Terraform, Kubernetes, and Ansible). This helps you generate configurations using Clojure code rather than writing them manually.

![screenshot](https://raw.githubusercontent.com/amiorin/big-config/main/screenshot.png)

## Table of Contents

*   [Install](#install)
*   [Tier-1 workflow language](#tier-1-workflow-language)
    *   [Manual](#manual)
    *   [Example](#example)
    *   [Advantages](#advantages)
*   [Advanced Topics](#advanced-topics)
    *   [Development](#development)
        *   [Workflow](#workflow)
        *   [Rationale](#rationale)
            *   [Configuration Languages vs. Programming Languages](#configuration-languages-vs-programming-languages)
            *   [Managing Code and Configuration Across Repositories](#managing-code-and-configuration-across-repositories)
            *   [The Role of Code in Managing Complexity](#the-role-of-code-in-managing-complexity)
            *   [Workflows as Code: Composition and Control](#workflows-as-code-composition-and-control)
            *   [Error Handling: Exit Codes, Not Exceptions](#error-handling-exit-codes-not-exceptions)
            *   [Testability and Refactoring Confidence](#testability-and-refactoring-confidence)
            *   [Reusable Libraries Over Standalone Tools](#reusable-libraries-over-standalone-tools)
            *   [Maintaining a Fast Feedback Loop](#maintaining-a-fast-feedback-loop)
            *   [The Role of Clojure](#the-role-of-clojure)
*   [Real-World Example: Preventing Common Infrastructure Errors](#real-world-example-preventing-common-infrastructure-errors)
    *   [Analysis of the Problem](#analysis-of-the-problem)
    *   [How big-config Addresses Such Issues](#how-big-config-addresses-such-issues)
*   [Q&A](#qa)
*   [Branches](#branches)
*   [Contributing](#contributing)
*   [License](#license)

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

## Tier-1 workflow language

The Tier-1 workflow language is a simple Domain-Specific Language (DSL) used via the `bb` (Babashka) command-line tool. It allows developers to combine various operations into a cohesive workflow. This approach streamlines the process of generating and managing configurations.

Key operations available in the Tier-1 workflow language include:
* Generating configuration files (the `build` step).
* Acquiring or releasing a lock to prevent conflicting changes.
* Checking if the local Git working directory is clean and synchronized with the remote repository.
* Pushing changes to the remote repository within a transaction.

These fundamental operations help teams collaborate effectively on infrastructure management without needing extensive manual coordination.

### Manual
```
Usage: bb <step|cmd>+ -- <module> <profile> [global-args]
```

In this syntax:
* `bb` refers to Babashka, a fast-starting scripting environment for Clojure.
* `<step|cmd>+` means one or more steps or commands.
* Steps are predefined actions like `build` or `lock`.
* Commands are direct calls to tools (e.g., `tofu:apply`), where `:` is replaced with a space in the actual execution (e.g., `tofu apply`).
* `--` separates the `big-config` steps/commands from the arguments passed to them.
* `<module>` refers to a specific configuration module you're working with (e.g., a specific service or environment).
* `<profile>` refers to a variation of a module (e.g., `dev`, `prod`).
* `[global-args]` are any additional arguments needed by the commands.

The available steps are listed below. Anything that is not a step is considered a command.

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
  tofu:apply:-auto-approve     tofu apply -auto-approve
  ansible-playbook:main.yml    ansible-playbook main.yml

```

### Example

```
bb build lock git-check tofu:init tofu:apply:-auto-approve git-push unlock-any -- alpha prod
```

This command demonstrates a Tier-1 workflow defined and run directly in the command line using `babashka` (the `bb` command). Let's break it down:
* `build`: Uses `deps-new` (a Clojure project templating tool) to generate configuration files for the `alpha` module with the `prod` profile.
* `lock`: Acquires a lock, ensuring that only one process modifies the infrastructure at a time (similar to a feature in Atlantis).
* `git-check`: Verifies that your local Git repository is clean (no uncommitted changes) and up-to-date with the `origin` (remote repository).
* `tofu:init`: Runs `tofu init` in the target directory for the `alpha` module.
* `tofu:apply:-auto-approve`: Runs `tofu apply -auto-approve` in that same target directory.
* `git-push`: Pushes your committed changes to the remote repository.
* `unlock-any`: Releases the lock, allowing others to make changes.

This entire sequence is executed for the `alpha` module and `prod` profile.

### Advantages
* **Faster Development Cycle:** Compared to tools like Atlantis, `big-config` can speed up the "inner loop" (the iterative cycle of coding, building, and testing).
* **Simplified Account Management:** Typically, only two cloud provider accounts (e.g., `prod` and `dev`) are needed. The `lock` feature allows developers and CI/CD systems to safely share the same AWS account for development and integration.
* **Safer Refactoring:** Because the generated configuration files (often in a `dist` or `target` directory) are committed to Git, you can easily track any unintended changes introduced when refactoring the Clojure code that generates these files. This makes refactoring much less risky.
* **Focused Tooling:** Compared to tools like AWS CDK, `big-config` primarily focuses on Clojure for logic and OpenTofu (or Terraform) for infrastructure definition. It aims to simplify the generation of necessary JSON/YAML configurations without overcomplicating the process.

## Advanced Topics

## Development

The following sections detail the inner workings of `big-config`. This information is for those interested in understanding its design or extending its core capabilities, not for everyday use of the Tier-1 workflows.

### Workflow
Tier-0 workflows in `big-config` are defined directly in Clojure code. Think of them not as a separate language, but as Clojure functions that control the flow of operations, similar to how an `if` statement directs program execution. These workflows are designed to be modular (composable) and adaptable through "step functions" (`step-fns`).

Here's a breakdown of the core concepts:
*   **Workflows and Steps:** Workflows are made up of individual `steps`. Each step performs a specific action.
*   **Step Identification:** Each `step` is identified by a Clojure `qualified keyword` (e.g., `::my-org/my-step`). This helps avoid naming conflicts.
*   **Wiring Steps:** Each step is "wired" to a Clojure `function` that executes its logic, and then to a `next-step` that defines what happens next.
*   **Shared Options (`opts` map):** An `opts` map (a Clojure map holding options) is passed through all steps. Keys in this map are also `qualified keywords` to prevent clashes when combining different steps and workflows.
*   **Inspiration:** This design is similar to how HTTP servers use middlewares to process requests or how `clojure.test` uses fixtures to set up and tear down test environments.
*   **Branching (`next-fn`):** When a step can lead to different outcomes, a `next-fn` (next function) is used to decide the subsequent step based on the current situation.
*   **Extensibility (`step-fns`):** `step-fns` (step functions) are a powerful feature allowing you to inject custom behavior before or after a standard workflow step runs, without altering the original workflow code. For example, a `guardrail` to prevent accidental destruction of production resources can be implemented as a `step-fn`.
*   **Order of Execution for `step-fns`:** `step-fns` are executed in a Last-In, First-Out (LIFO) order. If you have multiple `step-fns` (e.g., A and B) modifying a core function (`fn`), they execute as `A (before) -> B (before) -> fn (core step) -> B (after) -> A (after)`.

Below are examples illustrating these concepts.

* **Simple Workflow: `hello world`**
  This example defines a basic workflow with two steps: `::start` prints "Hello world!" and then transitions to `::end`.
``` clojure
(->workflow {:first-step ::start
             :wire-fn (fn [step _]
                        (case step
                          ::start [#(do (println "Hello world!")
                                        %) ::end]
                          ::end [identity]))})
```

* **Conditional Workflow: `tofu`**
  This demonstrates a more complex workflow for OpenTofu operations, where a `next-fn` is used for conditional branching. For instance, certain steps might be skipped depending on the specified `action` (e.g., if the action is `:clean`, it might jump from `::mkdir` to `::run-action`).
``` clojure
(->workflow {:first-step ::start
             :wire-fn (fn [step step-fns]
                        (case step
                          ::start [ok ::read-module]
                          ::read-module [aero/read-module ::validate]
                          ::validate [(partial validate ::opts) ::mkdir]
                          ::mkdir [mkdir ::call-fns]
                          ::call-fns [(partial call/call-fns step-fns) ::run-action]
                          ::run-action [(partial run-action step-fns) ::end]
                          ::end [identity]))
             :next-fn (fn [step next-step {:keys [::action] :as opts}]
                        (cond
                          (= step ::end) [nil opts]
                          (and (= action :clean)
                               (= step ::mkdir))  [::run-action opts]
                          (and (= step ::read-module)
                               (#{:opts :lock :unlock-any} action)) [::run-action opts]
                          :else (choice {:on-success next-step
                                         :on-failure ::end
                                         :opts opts})))})
```

* **Example of a `step-fn`: Printing Status Messages**
  This `step-fn`, called `print-step-fn`, is designed to print colorful status messages (green for success, red for failure/error) before and after certain workflow steps execute. It inspects the `opts` map to provide context-specific messages.
``` clojure
(def print-step-fn
  (->step-fn {:before-f (fn [step {:keys [::bc/err
                                          ::bc/exit] :as opts}]
                          (binding [util/*escape-variables* false] ; Temporarily disable variable escaping for message rendering
                            (let [[lock-start-step] (lock/lock)      ; Get the keyword for the lock start step
                                  [unlock-start-step] (unlock/unlock-any)  ; Get the keyword for the unlock start step
                                  [check-start-step] (git/check)        ; Get the keyword for the git check step
                                  [prefix color] (if (= exit 0)      ; Determine message prefix and color based on exit status
                                                   ["\ueabc" :green.bold] ; Success: green checkmark
                                                   ["\uf05c" :red.bold])   ; Failure: red X
                                  ;; Conditional messages based on the current step:
                                  msg (cond
                                        (= step ::read-module) (p/render "Action {{ big-config..tofu/action|default:nil }} | Module {{ big-config..aero/module|default:nil }} | Profile {{ big-config..aero/profile|default:nil }} | Config {{ big-config..aero/config|default:nil }}" opts)
                                        (= step ::mkdir) (p/render "Making dir {{ big-config..run/dir }}" opts)
                                        (= step lock-start-step) (p/render "Lock (owner {{ big-config..lock/owner }})" opts)
                                        (= step unlock-start-step) "Unlock any"
                                        (= step check-start-step) "Checking if the working directory is clean"
                                        (= step ::compile-tf) (p/render "Compiling {{ big-config..run/dir }}/main.tf.json" opts)
                                        (= step ::run/run-cmd) (p/render "Running:\n> {{ big-config..run/cmds | first}}" opts)
                                        (= step ::call/call-fn) (p/render "Calling fn: {{ desc }}" (first (::call/fns opts)))
                                        (= step ::push) "Pushing last commit"
                                        (and (= step ::end) ; If it's the end step and there was an error message
                                             (> exit 0)
                                             (string? err)
                                             (not (str/blank? err))) err
                                        :else nil)] ; Default: no message
                              (when msg ; If a message was generated
                                (binding [*out* *err*] ; Print to standard error
                                  (println (bling [color (p/render (str "{{ prefix }} " msg) {:prefix prefix})]))))))) ; Print the formatted, colored message
              :after-f (fn [step {:keys [::bc/exit] :as opts}] ; Function to run AFTER the step
                         (let [[_ check-end-step] (git/check) ; Get the keyword for the git check end step
                               prefix "\uf05c" ; Default prefix for error messages
                               ;; Conditional messages for failures after certain steps:
                               msg (cond
                                     (= step check-end-step) "Working directory is NOT clean"
                                     (= step ::run/run-cmd) (p/render "Failed running:\n> {{ big-config..run/cmds | first }}" opts)
                                     :else nil)] ; Default: no message
                           (when (and msg ; If a message was generated
                                      (> exit 0)) ; And the step indicated failure
                             (binding [*out* *err*] ; Print to standard error
                               (println (bling [:red.bold (p/render (str "{{ prefix }} " msg) {:prefix prefix})]))))))})) ; Print the formatted, colored error message
```

### Rationale

This section outlines some of the thinking behind `big-config`'s design and its approach to infrastructure management.

#### Configuration Languages vs. Programming Languages
Often, configuration languages are used in situations where general-purpose programming languages could offer more power and flexibility. `big-config` advocates for using Clojure to generate configurations for several reasons:
*   **Leveraging Clojure's Strengths:** Clojure's data manipulation capabilities and REPL-driven development can simplify the creation and management of complex configurations.
*   **Reducing Cognitive Load:** New infrastructure tools (like OpenTofu, Helm, etc.) often introduce their own specialized configuration languages. Learning and managing these different languages can be burdensome. `big-config` proposes that a robust workflow library in a single language (Clojure) can often provide the necessary functionality, reducing this overhead.
*   **Reusability and Integration:** `big-config` aims to provide reusable components. For example, its internal implementation of a locking mechanism (similar to Atlantis's core feature) or a configuration generation approach (akin to CDK) is concise and integrated within its Clojure framework.
*   **Treating Tools as Libraries:** The `big-config` workflow library allows you to treat external command-line tools (like `tofu` or `ansible`) as if they were functions within your Clojure code. This "upgrades" standalone programs into composable library components, making them easier to integrate into automated workflows.
*   **Controlled Execution via Workflows:** Instead of developers or CI agents interacting directly and potentially inconsistently with various tools, `big-config` promotes the use of defined workflows. These workflows provide a safer, more controlled, and repeatable way to apply changes. The `lock` workflow in `big-config`, for instance, is a reusable component, unlike some features tied to specific tools.

#### Managing Code and Configuration Across Repositories
While many foundational aspects of software development are well-understood, maintaining quality and consistency across a large codebase, especially one spanning multiple repositories and languages, remains challenging.
*   **The DRY Principle:** The "Don't Repeat Yourself" (DRY) principle is more straightforward to apply within a single repository using a single language. It becomes significantly harder with multiple repositories and languages.
*   **Clojure for Consistency:** `big-config` suggests that by embedding Clojure (e.g., in a dedicated subfolder like `big-infra/`) within each repository, organizations can achieve better consistency and code/data sharing, similar to the benefits seen in monorepos or single-language projects.
*   **Interoperability:** A common workflow library (like the one in `big-config`) can facilitate interoperability even when different parts of a system are managed by different tools or written in other languages.

#### The Role of Code in Managing Complexity
`big-config` posits that solutions involving direct coding are often more scalable and adaptable to complex problem domains than no-code or low-code alternatives.
*   **Limitations of Declarative Approaches:** While valuable, relying solely on declarative markup languages (like YAML) for managing intricate systems can become challenging. As complexity grows, the expertise required to maintain these configurations effectively can resemble that of a programmer, but without the full power of a programming language.
*   **Empowering Developers:** The argument is that developers' skills are best utilized when they can apply programmatic solutions to complex configuration and infrastructure challenges, rather than being constrained by the limitations of purely declarative or GUI-driven tools.

#### Workflows as Code: Composition and Control
The architecture of `big-config` workflows emphasizes explicit control flow and composability, using standard Clojure features:
*   **Qualified Keywords for Uniqueness:** `Qualified keywords` (e.g., `:namespace/name`) are used extensively, especially in the shared `opts` (options) map that is passed through `step-fns`. This practice prevents naming collisions when different modules or steps introduce their own options, ensuring that `:my-company/timeout` doesn't clash with `:another-tool/timeout`.
*   **Composition of Step Functions:** As mentioned in the "Workflow" section, user-provided `step-fns` are combined with the main function of a workflow step (defined via `wire-fn`). This creates the `A B ... fn ... B A` execution chain (Last-In, First-Out for before/after logic). This allows behavior to be layered and extended without altering core workflow definitions.
*   **Composability through Consistent Interfaces:** Workflows, `step-fns`, and the underlying functions are all designed to accept an `opts` map. This consistent interface, combined with qualified keywords, is key to how `big-config` allows for the creation of complex workflows by nesting or sequencing simpler ones.
*   **Example of Complexity Managed:** For instance, the primary OpenTofu workflow used for CI/CD in `big-config` is itself composed of 39 distinct steps, which are organized into 7 smaller, focused workflows (handling concerns like Tofu operations, function calls, Git interactions, locking, command execution, and unlocking). This demonstrates how more complex behaviors are built from simpler, reusable parts, with nesting up to 3 levels deep.

``` clojure
:big-config.tofu/start
:big-config.tofu/read-module
:big-config.tofu/validate
:big-config.tofu/mkdir
:big-config.tofu/call-fns
:big-config.call/start
:big-config.call/call-fn
:big-config.call/call-fn
:big-config.call/end
:big-config.tofu/run-action
:big-config.action/check
:big-config.git/git-diff
:big-config.git/fetch-origin
:big-config.git/upstream-name
:big-config.git/pre-revision
:big-config.git/current-revision
:big-config.git/origin-revision
:big-config.git/compare-revisions
:big-config.git/end
:big-config.action/lock
:big-config.lock/generate-lock-id
:big-config.lock/delete-tag
:big-config.lock/create-tag
:big-config.lock/push-tag
:big-config.lock/end
:big-config.action/run-cmds
:big-config.run/start
:big-config.run/run-cmd
:big-config.run/run-cmd
:big-config.run/run-cmd
:big-config.run/end
:big-config.action/unlock
:big-config.unlock/generate-lock-id
:big-config.unlock/delete-tag
:big-config.unlock/delete-remote-tag
:big-config.unlock/check-remote-tag
:big-config.unlock/end
:big-config.action/end
:big-config.tofu/end
```

#### Error Handling: Exit Codes, Not Exceptions
`big-config` adopts an error handling strategy similar to shell command exit codes:
*   A `0` signifies success.
*   Any non-zero value indicates a failure.
Standard Clojure exceptions are caught and converted into this error code model. The success or failure of the last executed step is recorded in the `opts` map (typically under a key like `::bc/exit`). Functions like `choice` then use this value to determine the next step in the workflow, allowing for explicit error handling paths.

``` clojure
(defn ok [opts]
  (merge opts {::bc/exit 0
               ::bc/err nil}))
```

#### Testability and Refactoring Confidence
Managing infrastructure as code, especially with declarative tools like OpenTofu and Kubernetes, can make testing and refactoring more manageable and reliable compared to manual changes.
*   **Predictable Outputs:** Since configurations are generated from code, changes are more predictable.
*   **Built-in Test Utilities:** `big-config` provides helper functions like `stability` (which might compare generated configurations against committed versions) and `catch-nils` (to detect missing values) that can be integrated into your tests. These help catch unintended changes or errors early during refactoring or development.
*   **Dynamic Module Discovery:** Modules for testing can be discovered dynamically by looking for a specific tag (e.g., `#module`) in their `edn` configuration files, simplifying test setup.

``` clojure
(ns tofu-test
  (:require
   [aero.core :refer [read-config]]
   [big-config.aero :as aero]
   [big-config.call :as call]
   [big-config.run :as run]
   [clojure.test :refer [deftest is testing]]
   [tofu.aero-readers :refer [modules]]))

(defn dynamic-modules []
  (reset! modules #{})
  (read-config "big-config.edn")
  @modules)

(deftest main-stability-test
  (testing "checking if all dynamic files committed are equal to the test generated ones"
    (doall
     (for [module (dynamic-modules)]
       (let [opts {::aero/config "big-config.edn"
                   ::aero/module module
                   ::aero/profile :prod
                   ::run/dir [:big-config.aero/join
                              "tofu/"
                              :big-config.tofu/aws-account-id "/"
                              :big-config.aero/module]}]
         (call/stability opts module)
         (is true))))))

(deftest catch-nils-test
  (testing "checking that the map doesn't contain nils"
    (doall
     (for [module (dynamic-modules)]
       (let [opts {::aero/config "big-config.edn"
                   ::aero/module module
                   ::aero/profile :prod
                   ::run/dir [:big-config.aero/join
                              "tofu/"
                              :big-config.tofu/aws-account-id "/"
                              :big-config.aero/module]}]
         (call/catch-nils opts module)
         (is true))))))
```

#### Reusable Libraries Over Standalone Tools
A core tenet of `big-config` is to favor the development and sharing of Clojure libraries for infrastructure tasks, rather than relying on a multitude of disparate command-line tools.
*   **Operational Scripting with Babashka:** During operations (e.g., in CI/CD or local execution), Babashka is used to expose these Clojure libraries as fast-executing tasks.
*   **Embedded Infrastructure Logic:** `big-config` is typically intended to reside in a subfolder (e.g., `big-infra/`) within each repository. This encourages each repository to become both a producer (defining its specific infrastructure needs as Clojure code) and a consumer (reusing shared libraries and workflows).
*   **Simplified DRY:** This approach can make it easier to adhere to the DRY (Don't Repeat Yourself) principle by promoting code reuse and consistency.

#### Maintaining a Fast Feedback Loop
The speed at which developers can get feedback on their changes is crucial for maintaining quality and productivity.
*   **Impact of Quality on Feedback Time:** Lower quality often leads to longer feedback loops because bugs are typically discovered later in the development or deployment process.
*   **Automation and Testing:** To catch issues early, `big-config` emphasizes automation of operational tasks and an increased focus on writing tests for infrastructure code.
*   **Developer Focus:** By automating manual operational steps, developers can spend more time on development and less on firefighting. Automated tests help catch regressions before they escalate into incidents.
*   **Value of Regression Tests:** Investing time in writing tests to prevent regressions is crucial, even when time seems scarce, as it pays off in the long run by preventing repeated errors.
*   **Consistency Across Repositories:** Lack of automation can also lead to inconsistencies when changes need to be manually propagated across multiple repositories, risking errors and incidents.
*   **Efficiency and Quality:** Efficiency, effectiveness, adherence to DRY principles, and a fast feedback loop are seen as key enablers of rapid, high-quality software and infrastructure delivery.

#### The Role of Clojure
While Clojure is not yet as widespread as some other programming languages, `big-config` sees significant potential in its application to infrastructure management.
*   **A "Killer Application" for Clojure?:** `big-config` aims to showcase Clojure's strengths in this domain. The idea is that a compelling use case—like a robust framework for "workflows-as-code" combined with a library of reusable infrastructure modules—could establish Clojure as a strong alternative to traditional configuration languages.
*   **Streamlining Complex Systems:** This combination could offer a powerful and streamlined solution for managing complex systems, potentially driving broader Clojure adoption and ecosystem growth.

# Real-World Example: Preventing Common Infrastructure Errors

Consider an incident like the one described in the Zalando Engineering blog post: [Tale of 'metadpata': the revenge of the supertools](https://engineering.zalando.com/posts/2024/01/tale-of-metadpata-the-revenge-of-the-supertools.html). This section outlines how `big-config`'s approach could help prevent similar issues.

## Analysis of the Problem
In the described incident, a simple typographical error (`metadpata` instead of `metadata`) in a configuration led to a significant broken change. This highlights a common class of problems in managing infrastructure.

## How `big-config` Addresses Such Issues
`big-config` promotes several practices that can mitigate these risks:

1.  **Declarative Changes and Static Analysis:**
    *   Infrastructure changes should ideally be implemented declaratively. This means using tools like OpenTofu (or Terraform) to define the desired state, rather than making direct, imperative calls to cloud provider APIs (e.g., AWS API).
    *   By generating the declarative configuration (e.g., OpenTofu HCL or JSON) from Clojure code, you can introduce validation and static analysis steps *before* the configuration is ever applied. This can catch typos, structural errors, or policy violations early in the development cycle.

2.  **Unified Tooling with Clojure:**
    *   `big-config` advocates for using a single programming language, Clojure, to manage the different facets of infrastructure management: generating configurations, validating them, and implementing automation workflows.
    *   This perspective suggests that instead of relying on a collection of disparate "Supertools," a cohesive approach within one language can simplify the toolchain and improve consistency. The argument is that most infrastructure tasks fall into these three categories (generation, validation, workflow).

3.  **Actionable Guardrails with Code:**
    *   Vague mandates like "prevent large-scale changes" are difficult to enforce. `big-config` allows you to implement concrete `guardrails` as code within your workflows.
    *   For example, you can write a `step-fn` (as shown below) that explicitly blocks any attempt to destroy modules tagged as `prod` or `production`.
    *   This is an example of **compliance by design**: the system itself prevents undesirable actions. This is often more reliable than **compliance by behavior**, which relies on manual reviews that can be slow and error-prone.

``` clojure
(defn block-destroy-prod-step-fn [start-step]
  (->step-fn {:before-f (fn [step {:keys [::action ::aero/profile] :as opts}]
                          (let [msg (p/render "You cannot destroy module {{ big-config..aero/module }} in {{ big-config..aero/profile }}" opts)]
                            (when (and (= step start-step)
                                       (#{:destroy :ci} action)
                                       (#{:prod :production} profile))
                              (throw (ex-info msg opts)))))}))
```

![screenshot](https://raw.githubusercontent.com/amiorin/big-config/main/destroy.png)

# Q&A

**Q: What is `big-config` in a nutshell?**
A: `big-config` is a tool that adds a `build` step to your devops tools like Terraform, Kubernetes, and Ansible. This allows you to generate configuration files from Clojure code, promoting consistency and reducing manual errors. It also provides a workflow system to manage infrastructure changes safely, especially in team environments.

**Q: Do I need to know Clojure to use `big-config`?**
A: Yes, `big-config` leverages Clojure for its core functionality. While the tier-1 workflow language provides a simpler DSL for common operations, deeper customization and understanding of the system require Clojure knowledge. If you're new to Clojure but interested in `big-config`'s approach, it might be a good opportunity to learn.

**Q: What are the "tier-1 workflow language" and "tier-0 workflows"?**
A:
*   **Tier-1 workflow language:** This is a command-line DSL for composing pre-defined steps (like `build`, `lock`, `git-check`, `tofu:apply`). It's designed for ease of use in daily operations and CI/CD pipelines.
*   **Tier-0 workflows:** These are the underlying Clojure functions and data structures that define the actual logic of each step and how they connect. You'd interact with tier-0 if you need to create new, complex workflow behaviors beyond what tier-1 offers.

**Q: When should I consider using `big-config`?**
A: `big-config` is beneficial if you:
*   Manage infrastructure with tools like Terraform, Kubernetes, or Ansible.
*   Want to move away from manually editing large configuration files.
*   Prefer using a programming language (Clojure) for configuration logic.
*   Need a robust system for collaborative infrastructure development, including locking and git integration.
*   Are interested in a "workflows-as-code" approach built on Clojure.

**Q: How is `big-config` different from tools like Atlantis or CDK?**
A:
*   **Atlantis:** `big-config` provides similar locking capabilities to prevent concurrent modifications but aims for a faster inner development loop and uses Clojure for configuration generation.
*   **CDK (Cloud Development Kit):** While CDK allows defining infrastructure with familiar programming languages, `big-config` specifically focuses on Clojure and integrates a tier-1 workflow language for operational tasks. `big-config` argues that its approach to generating JSON/YAML is more straightforward for its supported tools.

**Q: How do I get started with developing or customizing workflows?**
A: Workflow development typically involves working with Clojure in a text editor like Emacs with CIDER for an interactive experience. For running operational tasks, `babashka` is used for its fast startup times. The "Advanced Topics" section of this README delves into the tier-0 workflow implementation details.

# Branches

| branch       | description                                            |
|--------------|--------------------------------------------------------|
| ansible      | wip for a clojure only lib to generate ansible code    |
| gh-action    | zero-code build step to create a GitHub action         |
| main         | big-config home                                        |
| deps-new     | deps-new template for any big-config project           |
| orphan       | orphan branch to start new worktrees                   |
| odoyle-rules | old version of big-config integrated with odoyle-rules |

# Contributing

Contributions to `big-config` are welcome and encouraged! Whether you're reporting a bug, suggesting a new feature, or submitting code changes, your input is valuable.

Please consider the following guidelines:

## Reporting Bugs or Suggesting Features

*   If you encounter a bug or have an idea for a new feature, please check the existing [issues on GitHub](https://github.com/amiorin/big-config/issues) to see if it has already been reported or discussed.
*   If not, please open a new issue. Provide as much detail as possible:
    *   For bugs: Steps to reproduce, expected behavior, actual behavior, your `big-config` version, and relevant environment details.
    *   For features: A clear description of the proposed feature and why it would be beneficial.

## Submitting Pull Requests

1.  **Fork the repository:** Create your own fork of the `big-config` repository on GitHub.
2.  **Create a new branch:** For each new feature or bug fix, create a new branch in your fork, preferably with a descriptive name (e.g., `feat/add-new-command` or `fix/resolve-locking-issue`).
3.  **Make your changes:** Write your code, ensuring you follow the existing code style and conventions.
4.  **Add tests:** If you're adding a new feature or fixing a bug, please include relevant tests to ensure correctness and prevent regressions.
5.  **Ensure tests pass:** Run the existing test suite to make sure your changes haven't introduced any regressions. (Details on running tests would ideally be in a `CONTRIBUTING.md` or testing documentation.)
6.  **Write clear commit messages:** Follow standard practices for writing informative commit messages.
7.  **Submit the pull request:** Push your changes to your fork and then open a pull request against the `main` branch of the `amiorin/big-config` repository. Provide a clear description of your changes in the pull request.

## Contribution Guidelines File

For more detailed contribution guidelines, coding standards, and information about the development process, please look for a `CONTRIBUTING.md` file in the root of the repository. (If this file doesn't exist yet, following the general guidelines above is a good start.)

We appreciate your contributions to making `big-config` better!

# License

Copyright © 2025 Alberto Miorin

`big-config` is released under the [MIT License](https://opensource.org/licenses/MIT).
