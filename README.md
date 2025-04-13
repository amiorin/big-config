<h1 align=center><code>big-config</code></h1>

`big-config` is an alternative to traditional configuration languages, schema languages, and workflow engines for operations. Its goal is to replace solutions like: `atlantis`, `cdk`, `helm`, `hcl`, `jsonschema`, `yaml`, `toml`, `json`, `aws step functions`, `kustomize`, `argocd`, `pkl`, `cud`, `dhall`, `jsonet`, `make`.

At the moment, it can be used to replace `atlantis` and `cdk`.

![screenshot](https://raw.githubusercontent.com/amiorin/big-config/main/screenshot.png)

## Screenshot
`just tofu ci alpha dev` is a workflow implemented in `big-config` and invoked using `just` for convenience. `ci` is the action to trigger the `continuous integration` of the module `alpha`. `alpha` is responsible for creating some AWS resources, and `dev` is the profile used for development.

### Steps executed
* Load and validate the configuration.
* Compile the `main.tf.json` (like `cdk`).
* Check that the working directory is clean.
* Lock module `alpha` for profile `dev`.
* Run `tofu init|apply|destroy`.
* Unlock module `alpha` for profile `dev`.

### Advantages
* Compared to `atlantis`, `big-config` enables a faster `inner loop`. Only two accounts are needed, `prod` and `dev`. The `lock` workflow enables developers and CI to share the same AWS account for development and integration. Refactoring the code that generates the configuration files is trivial because of the test for catching `nils` gg in `json` files and because of the test for comparing the previous version for any files with the new version. 
* Compared to `cdk`, `big-config` supports only `clojure` and `tofu`. The problem of generating `json` files should not be blown out of proportion.

## Install
Star, fork and clone the repository. Run `just` overriding `AWS_ACCOUNT_ID` and `AWS_PROFILE`. The `AWS_ASSUME_ROLE` is optional.

``` shell
# crate the bucket for tofu states
just create-bucket 111111111111 eu-west-1
# run ci for module alpha in dev
just AWS_PROFILE=aaaaaaaaaaaa \
     AWS_ACCOUNT_ID=111111111111 \
     AWS_ASSUME_ROLE=arn:aws:iam::111111111111:role/aaaaaaaaaaaa \
     tofu ci alpha dev
```

![screenshot](https://raw.githubusercontent.com/amiorin/big-config/main/just.png)

## Workflow
`workflows` are implemented in code, and they are `flow control expression` like `if`. They are composable and extendable with `step-fns`. There is no workflow language. `workflows` are composed of `steps`. A `step` is identified by a `qualified keyword`, and it is wired to a `function` and to a `next-step`. The `opts` map is shared between all `steps` and all keys are `qualified keywords` to avoid collision when composing different `steps` in a new `workflow`. This pattern resembles the implementation HTTP server with middlewares and `clojure.test` fixtures. A `next-fn` is used to implement branching when the `next-step` is not always the only possible flow of execution. `step-fns` are used to extend the behavior of `workflows` without modifying them. For example, the `guardrail` that stops a workflow from destroying production AWS resources is implemented as a `step-fn`. The order of execution of `step-fns` is LIFO (`A B ... fn ... B A`).

* Workflow `hello world`.
``` clojure
(->workflow {:first-step ::start
             :wire-fn (fn [step _]
                        (case step
                          ::start [#(do (println "Hello world!")
                                        %) ::end]
                          ::end [identity]))})
```

* Workflow `tofu` where the `next-fs` is needed.
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

* `step-fn` to print green and red messages.
``` clojure
(def print-step-fn
  (->step-fn {:before-f (fn [step {:keys [::bc/err
                                          ::bc/exit] :as opts}]
                          (binding [util/*escape-variables* false]
                            (let [[lock-start-step] (lock/lock)
                                  [unlock-start-step] (unlock/unlock-any)
                                  [check-start-step] (git/check)
                                  [prefix color] (if (= exit 0)
                                                   ["\ueabc" :green.bold]
                                                   ["\uf05c" :red.bold])
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
                                        (and (= step ::end)
                                             (> exit 0)
                                             (string? err)
                                             (not (str/blank? err))) err
                                        :else nil)]
                              (when msg
                                (binding [*out* *err*]
                                  (println (bling [color (p/render (str "{{ prefix }} " msg) {:prefix prefix})])))))))
              :after-f (fn [step {:keys [::bc/exit] :as opts}]
                         (let [[_ check-end-step] (git/check)
                               prefix "\uf05c"
                               msg (cond
                                     (= step check-end-step) "Working directory is NOT clean"
                                     (= step ::run/run-cmd) (p/render "Failed running:\n> {{ big-config..run/cmds | first }}" opts)
                                     :else nil)]
                           (when (and msg
                                      (> exit 0))
                             (binding [*out* *err*]
                               (println (bling [:red.bold (p/render (str "{{ prefix }} " msg) {:prefix prefix})]))))))}))
```

# Rationale
## Configuration languages
Configuration languages are misused in modern software development. Developers are stuck with them even when programming languages would be a better solution. `clojure` should be the only programming language used to generate configurations. New tools like `tofu` or `helm` include new configuration languages, increasing the cognitive load. Most of the time, a workflow library can implement the functionality provided by these new tools saving the overhead of learning a new configuration language. `atlantis`'s core feature is the lock, and it was implemented in 100 lines of code. `cdk` was implemented in 20 lines of code. Tools will always require integration, `big-config` workflow library upgrades `programs` to `functions` enabling the transformation of `tools` into `libraries`. `tools` should not be used directly by `developers` only `workflows` should be used by developers and agents. `atlantis`'s lock feature is not reusable while the `lock` workflow can be reused.

## Number of repositories
Software development is a solved problem, but we have software like Postgres, Git, and Emacs where the quality is high and apps on our smartphone where the quality is low. There is a correlation between the number of repositories of an organization and the quality of their main product. The DRY (don't repeat yourself) principle is trivial to implement in a single repository that uses a single programming language, but it becomes difficult when there are multiple repositories written in multiple languages. `clojure` can be used in a subfolder of every repository to enable the economies that we have in projects with a single repository and a single language. Sharing data and code will become trivial again. The workflow library enables the interoperability of software written in different languages.

## No-code or low-code solutions
Only code-intensive solutions scale with complexity of the domain. We are wasting a generation of developers by distracting them with no-code and low-code tools. The `YAML` developer is the pinnacle of this nonsense where years of training are wasted by using their talent to manually curate configuration files that are implemented in failed programming languages.

## Workflows as flow control expressions
The design of `big-config` requires using `qualified keywords` in the map shared between `step-fns`. During every `step`, the `step-fns` provided by the user of the `workflow` are composed with the `step-fn` associated with the `step` defined in the `workflow` through the `wire-fn`. The result is the following flow `A B ... fn ... B A` where `A` and `B` are example of functions provider by the user and `fn` is the function provided by the `workflow`. The composability is obtained because both `workflows`, `step-fns`, and `fns` accept `opts` with `qualified keywords`. A complex `workflows` can be implemented with simple and nested `workflows`. The `tofu workflow` for CI is 39 `steps`, it's composed of 7 `workflows` (`tofu`, `call`, `action`, `git`, `lock`, `run`, and `unlock`) and it is 3 levels deep.

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

## Errors instead of exceptions
Errors are implemented like exit code in the shell. 0 for success and anything else for failure. The last step success or failure is stored in the `opts` and the `choice` function uses it to decide the `next-step`. Exception are converted to Errors.

``` clojure
(defn ok [opts]
  (merge opts {::bc/exit 0
               ::bc/err nil}))
```

## Testability
Declarative infrastructure like `tofu` and `k8s` make testing and refactoring trivial. There are two functions (`stability` and `catch-nils`) ready to be used in your tests to catch bugs and nil values during refactoring. The `modules` are discovered dynamically using the tag `#module` in the `edn` config file.

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

## Libraries instead of tools
`clojure` is used to develop and share libraries. During operations, `babashka` and `just` are used to expose these libraries through shell commands. `big-config` lives in the subfolder conventionally called `big-infra` in every repository. Every repository becomes a producer and consumer of code and data. DRY becomes trivial.

``` just
# tofu opts|init|plan|apply|destroy|lock|unlock-any
[group('tofu')]
tofu action module profile:
    #!/usr/bin/env -S bb --config big-infra/bb.edn
    (require '[big-config.tofu :refer [main]])
    (main {:args [:{{ action }} :{{ module }} :{{ profile }}]
           :config "big-infra/big-config.edn"})
```

## Fast feedback loop
When quality goes down the feedback loop time goes up because bugs are discovered much later after creation. To catch bugs as soon as they are created we need to increase the time available for writing test code. Instead of adding more developers the focus should be on the automation of manual steps. Developers should spend more time in development than operations and this is possible if operations are automated and tests are catching bugs before they become an incident. It doesn't pay to fix bugs without writing a test to avoid a regression because of the lack of time. Another outcome of the lack of automation is when a change to one repository needs to be repeated in other N repositories manually. Eventually a developer will forget to do it and an incident will happen. Efficiency and effectiveness are keys to quality. DRY and fast feedback loop will enable fast changes and high quality.

## Clojure
`clojure` is not yet a mainstream programming language, but its potential remains significant. To accelerate its adoption, `clojure` could benefit from a "killer application" — a compelling use case or tool that positions it uniquely in the software ecosystem. One promising direction might be to establish `clojure` as an alternative to traditional configuration languages by developing a library of reusable infrastructure modules alongside a robust framework for workflows-as-code. This combination could create a powerful, streamlined solution for managing complex systems, potentially driving broader adoption and sparking the momentum needed to grow its ecosystem.

# Real world example
How to avoid incidents like the one described in [Tale of 'metadpata': the revenge of the supertools](https://engineering.zalando.com/posts/2024/01/tale-of-metadpata-the-revenge-of-the-supertools.html) 

## Analysis
Reading the article we can identify this problem:
1. A validation error with `metadpata` instead of `metadata` led to a broken change.

## Solution
1. Changes should be implemented in a declarative way. `tofu` should be used instead of talking directly to the AWS API. This will allow implementing static analysis to correct bugs during development.
1. No need to invent a new category Supertools for software. These software solutions belong to the 3 categories (generate configuration, validate, and implement workflows to automate) and they should be implemented in a single programming language that is `clojure`.
1. "Large scale changes" is not actionable. `big-config` allows implementing `guardrails` rules with code. For example, it doesn't allow destroying `modules` in `prod`. A change is compliant with rules and compliance can be by design or by behavior. `guardrails` enable compliance by design. Manual reviews are slow and error-prone, but they are needed when compliance is by behavior.

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
Q: I don't know `clojure`, how can I use `big-config`?

A: You cannot. `big-config` is a library plus some ideas about modern software development. You could adopt the ideas and reimplement `big-config` in another language. Or you could make an initial investment in learning `clojure`. It could be worth it.

Q: How do you develop workflows?

A: I work in the terminal. I use `clojure`, `emacs`, and `cider` during development. I use `babashka` and `just` during operations. `babashka` is amazing for the startup time. `clojure` developer experience is still better than `babashka`. For example the `cider-inspector` works only with `clojure` and not with `babashka` and the `compilation` step of `clojure` is very convenient to catch bugs while developing.

## License

Copyright © 2025 Alberto Miorin

`big-config` is released under the [MIT License](https://opensource.org/licenses/MIT).
