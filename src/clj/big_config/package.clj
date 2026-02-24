(ns big-config.package "
  A BigConfig Package ([announcement](https://bigconfig.it/blog/introducing-bigconfig-package/)) is a standard Clojure project.
  The core logic of a package is a function authored via the [BigConfig Workflow](https://bigconfig.it/api/workflow/).

  ### Babashka
  Your package is a dependency within your `bb.edn` and it is mapped to a
  Babashka task.

  **1. Register the Task**: Add the package to your `:deps` and define the task
  in `bb.edn`:
  ```clojure
  {:deps {io.github.amiorin/redis {:git/sha \"eaff6f\"}}
   :tasks
   {:requires ([package.redis :as r])
    ;; Provision a Redis instance using the BigConfig Workflow
    redis (r/redis* *command-line-args*)}}
  ```

  **2. Execute via CLI**: Standardize your lifecycle commands. Note that we use
  `create` rather than `install` to reflect that infrastructure is being
  actively provisioned as part of the delivery.
  ```bash
  # Provision the infrastructure and software
  bb redis create

  # Tear down the resources
  bb redis delete
  ```
  > **Note:** Because BigConfig leverages Babashka, startup times are
  near-instant, making it ideal for CI/CD pipelines and developer inner-loops
  alike.

  ### Development
  Change the dependency from remote to local. If you are forking a package,
  probably it's already in development mode.

  ```clojure
  {:deps {io.github.amiorin/redis {:local/root \".\"}
   :tasks
   {:requires ([package.redis :as r])
    ;; Provision a Redis instance using the BigConfig Workflow
    redis (r/redis* *command-line-args*)}}
  ```

  ### Available Steps
  #### Main steps
  | Step       | Description                                                     |
  | :----      | :----                                                           |
  | **create**     | Create the delivery                                             |
  | **delete**     | Delete the delivery                                             |
  #### Coordination steps
  You can use these client side steps to achieve the same thing you have with
  Atlantis for Terraform.
  | Step       | Description                                                     |
  | :----      | :----                                                           |
  | **git-check**  | Verifies the working directory is clean and synced with origin. |
  | **git-push**   | Pushes local commits to the remote repository.                  |
  | **lock**       | Acquires an execution lock.                                     |
  | **unlock-any** | Force-releases the lock, regardless of the current owner.       |


  ### Options

  The user can pass his options to the package

  ```clojure
  {:deps {io.github.amiorin/redis {:git/sha \"eaff6f\"}}
   :tasks
   {:requires ([redis :as r])
    ;; Provision a Redis instance using the BigConfig Workflow
    redis (r/redis* *command-line-args* {:big-config.render/profile \"prod\"})}}
  ```

  > **Note:** bb.edn doesn't support the `::` notation like Clojure files.

  ### Advanced cases
  If you need to override the `step-fns` or generate options dynamically, you
  can override the `<workflow>*` function itself.

  ```clojure
  (ns my-fork.package.redis
    (:require
     [big-config :as bc]
     [big-config.render :as render]
     [big-config.workflow :as workflow]
     [package.redis :as r]))

  (defn redis*
    [args & [opts]]
    (let [profile \"default\"
          step-fns [(fn [f step opts] (f step opts))]
          opts (merge (workflow/parse-args args)
                      {::bc/env :shell
                       ::render/profile profile
                       ::workflow/prefix (format \".dist/%s\" profile)}
                      opts)]
      (r/redis step-fns opts)))
  ```

  ```clojure
  {:deps {io.github.amiorin/redis {:git/sha \"eaff6f\"}}
   :tasks
   {:requires ([my-fork.package.redis :as r])
    ;; Provision my version of Redis
    redis (r/redis* *command-line-args*)}}
  ```
  ")

(defn placeholder
  "There is only a namespace for now."
  [])
