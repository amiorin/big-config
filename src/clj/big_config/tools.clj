(ns big-config.tools
  (:require
   [babashka.fs :as fs]
   [big-config :as bc]
   [big-config.render :as render]
   [big-config.step :as step]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]))

(defn- help
  [& _]
  (println "Use `clojure -A:deps -Tbig-config help/doc` instead"))

(comment
  (help))

(def non-blank-string? (s/and string? (complement str/blank?)))
(s/def ::target-dir non-blank-string?)
(def boolean-or-keyword? (s/or :keyword keyword? :boolean boolean?))
(s/def ::overwrite boolean-or-keyword?)
(s/def ::aws-profile non-blank-string?)
(s/def ::region non-blank-string?)
(s/def ::dev non-blank-string?)
(s/def ::prod non-blank-string?)

(defn- rename
  [{:keys [target-dir]} _]
  (fs/walk-file-tree target-dir
                     {:visit-file
                      (fn
                        [path _]
                        (let [path (str path)]
                          (when (str/ends-with? path ".source")
                            (fs/move path (str/replace path #".source$"  "") {:replace-existing true})))
                        :continue)}))

(defn- prepare
  [args]
  (reduce-kv (fn [a k v]
               (cond
                 (#{:step-fns} k) a
                 (#{:overwrite :opts} k) (assoc a k v)
                 :else (assoc a k (str v)))) {} args))

(defn- args->opts
  [args spec]
  (let [args (s/conform spec args)
        _ (when (s/invalid? args)
            (throw (ex-info "Invalid input" (s/explain-data spec args))))
        args (update args :overwrite #(second %))
        opts (:opts args)
        template (dissoc args :opts)]
    (merge {::render/templates [template]} opts)))

(defn- run-template
  [spec {:keys [step-fns] :as args} defaults]
  (let [template-name (name spec)
        s (format "render -- big-config %s" template-name)
        common {:template template-name
                :target-dir template-name
                :overwrite true
                :opts {::bc/env :shell}}
        args (merge common defaults (prepare args))
        opts (args->opts args spec)]
    (if step-fns
      (step/run-steps s opts step-fns)
      (step/run-steps s opts))))

(s/def ::terraform (s/keys :req-un [::target-dir ::overwrite ::aws-profile ::region ::dev ::prod]))

(defn terraform
  "Create a repo to manage Terraform/Tofu projects with BigConfig.

  Options:
  - :target-dir  target directory for the template (`terrafom` is the default)
  - :overwrite   true or :delete (the target directory)
  - :aws-profile aws profile in ~/.aws/crendentials
  - :region      aws region
  - :dev         aws account id for dev
  - :prod        aws account id for prod

  Example:
    clojure -Tbig-config terraform :region us-west-1"
  [& {:as args}]
  (run-template ::terraform args {:aws-profile "default"
                                  :region "eu-west-1"
                                  :dev "111111111111"
                                  :prod "222222222222"
                                  :post-process-fn rename
                                  :transform [["root"
                                               {"projectile" ".projectile"}
                                               {:tag-open \<
                                                :tag-close \>
                                                :filter-open \<
                                                :filter-close \>}]]}))

(comment
  (terraform :opts {::bc/env :repl}
             :aws-profile "251213589273"
             :region "eu-west-1"
             :dev "251213589273"
             :prod "251213589273"))

(s/def ::devenv (s/keys :req-un [::target-dir ::overwrite]))

(defn devenv
  "Create the devenv files for Clojure and Babashka development.

  Options:
  - :target-dir  target directory for the template (current directory is the default)

  Example:
    clojure -Tbig-config devenv"
  [& {:as args}]
  (run-template ::devenv args {:target-dir "."
                               :transform [["root"
                                            {"envrc" ".envrc"
                                             "devenv.nix" "devenv.nix"
                                             "devenv.yml" "devenv.yml"}
                                            :only
                                            :raw]]}))

(comment
  (devenv :opts {::bc/env :repl}))

(s/def ::dotfiles (s/keys :req-un [::target-dir ::overwrite]))

(defn dotfiles
  "Create a repo to manage dotfiles with BigConfig.

  Options:
  - :target-dir  target directory for the template (`dotfiles` is the default)
  - :overwrite   true or :delete (the target directory)

  Example:
    clojure -Tbig-config dotfiles"
  [& {:as args}]
  (run-template ::dotfiles args {:post-process-fn rename
                                 :transform [["root"
                                              {"projectile" ".projectile"
                                               "envrc" ".envrc"
                                               "envrc.private" ".envrc.private"}
                                              :raw]]}))

(comment
  (dotfiles :opts {::bc/env :repl}))

(s/def ::ansible (s/keys :req-un [::target-dir ::overwrite]))

(defn ansible
  "Create a repo to manage Ansible projects with BigConfig.

  Options:
  - :target-dir  target directory for the template (`ansible` is the default)
  - :overwrite   true or :delete (the target directory)

  Example:
    clojure -Tbig-config ansible"
  [& {:as args}]
  (run-template ::ansible args {:post-process-fn rename
                                :transform [["root"
                                             {"envrc" ".envrc"
                                              "envrc.private" ".envrc.private"
                                              "gitignore" ".gitignore"
                                              "projectile" ".projectile"}
                                             :raw]]}))

(comment
  (ansible :opts {::bc/env :repl}))

(s/def ::multi (s/keys :req-un [::target-dir ::overwrite]))

(defn multi
  "Create a repo to manage both Ansible and Terraform projects with BigConfig.

  Options:
  - :target-dir  target directory for the template (`ansible` is the default)
  - :overwrite   true or :delete (the target directory)

  Example:
    clojure -Tbig-config multi"
  [& {:as args}]
  (run-template ::multi args {:post-process-fn rename
                              :transform [["root"
                                           {"envrc" ".envrc"
                                            "envrc.private" ".envrc.private"
                                            "gitignore" ".gitignore"
                                            "projectile" ".projectile"}
                                           :raw]]}))

(comment
  (multi :opts {::bc/env :repl}))

(s/def ::action (s/keys :req-un [::target-dir ::overwrite]))

(defn action
  "Create a GitHub action for the CI of a Clojure project.

  Options:
  - :target-dir  target directory for the template (`ansible` is the default)
  - :overwrite   true or :delete (the target directory)

  Example:
    clojure -Tbig-config action"
  [& {:as args}]
  (run-template ::action args {:target-dir ".github/workflows"
                               :transform [["root"
                                            {"ci.yml" "ci.yml"}
                                            {:tag-open \<
                                             :tag-close \>
                                             :filter-open \<
                                             :filter-close \>}]]}))

(comment
  (action :opts {::bc/env :repl}))
