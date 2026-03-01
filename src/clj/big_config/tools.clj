(ns big-config.tools
  "
  This is the list of templates available in BigConfig out of the box.
  See [Clojure Tools](/guides/clojure-tools/) guide.
  "
  (:require
   [babashka.fs :as fs]
   [babashka.neil :as neil]
   [babashka.process :refer [shell]]
   [big-config :as bc]
   [big-config.render :as render]
   [big-config.selmer-filters]
   [big-config.step-fns :as step-fns]
   [big-config.utils :refer [debug deep-merge]]
   [big-config.workflow :as workflow]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [selmer.filters :refer [add-filter!]]))

(defn- help
  [& _]
  (println "Use `clojure -A:deps -Tbig-config help/doc` instead"))

(comment
  (help))

(def ^:no-doc non-blank-string? (s/and string? (complement str/blank?)))
(s/def ::target-dir non-blank-string?)
(def ^:no-doc boolean-or-keyword? (s/or :keyword keyword? :boolean boolean?))
(s/def ::overwrite boolean-or-keyword?)
(s/def ::aws-profile non-blank-string?)
(s/def ::region non-blank-string?)
(s/def ::dev non-blank-string?)
(s/def ::prod non-blank-string?)

(defn- git-setup
  [{:keys [target-dir]} _]
  (when-not (fs/exists? (str target-dir "/.git"))
    (shell {:dir target-dir} "git init")
    (shell {:dir target-dir} "git add -A")
    (shell {:dir target-dir} "git commit -m 'initial import'")))

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

(defn- upgrade
  [{:keys [target-dir]} _]
  (binding [*out* (java.io.StringWriter.)]
    (neil/dep-upgrade {:opts {:deps-file (format "%s/deps.edn" target-dir)}})))

(defn- prepare
  [args]
  (reduce-kv (fn [a k v]
               (cond
                 (#{:overwrite :opts :post-process-fn :data-fn :template-fn} k) (assoc a k v)
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

(def step-fns [(step-fns/->exit-step-fn ::workflow/end)
               (step-fns/->print-error-step-fn ::workflow/end)])

(defn- run-template
  [spec args defaults]
  (let [template-name (name spec)
        common {:template (format "big-config/%s" template-name)
                :target-dir template-name
                :overwrite true
                :opts (merge (workflow/parse-args "render")
                             {::bc/env :shell
                              ::workflow/name spec})}
        args (deep-merge common defaults (prepare args))
        opts (args->opts args spec)]
    (workflow/run-steps step-fns opts)))

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
                                  :post-process-fn [rename upgrade]
                                  :transform [["root"
                                               {"projectile" ".projectile"}
                                               {:tag-open \<
                                                :tag-close \>
                                                :filter-open \{
                                                :filter-close \}}]]}))

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
  (run-template ::dotfiles args {:post-process-fn [rename upgrade git-setup]
                                 :transform [["root"
                                              {"projectile" ".projectile"
                                               "envrc" ".envrc"
                                               "gitignore" ".gitignore"}
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
  (run-template ::ansible args {:post-process-fn [rename upgrade]
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
  - :target-dir  target directory for the template (`multi` is the default)
  - :overwrite   true or :delete (the target directory)

  Example:
    clojure -Tbig-config multi"
  [& {:as args}]
  (run-template ::multi args {:post-process-fn [rename upgrade]
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
  - :target-dir  target directory for the template (`action` is the default)
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

(s/def ::path non-blank-string?)
(s/def ::ns non-blank-string?)
(s/def ::name non-blank-string?)
(s/def ::tools (s/keys :req-un [::target-dir ::overwrite ::path ::ns ::name]))

(defn tools
  "Create a tools.clj for a Clojure project.

  Options:
  - :target-dir  target directory for the template (current directory is the default)
  - :path        path for the clojure source code
  - :ns          namespace containing the file tools.clj
  - :name        override the default name `tools`

  Example:
    clojure -Tbig-config tools"
  [& {:as args}]
  (run-template ::tools args {:target-dir "."
                              :name "tools"
                              :post-process-fn rename
                              :transform [["root"
                                           {"tools.clj.source" "{{ path }}/{{ ns|->file }}/{{ name|->file }}.clj.source"}
                                           {:tag-open \<
                                            :tag-close \>
                                            :filter-open \<
                                            :filter-close \>}]]}))

(comment
  (tools :opts {::bc/env :repl}
         :path "src/clj"
         :ns "big-config"
         :name "tools-v2"))

(s/def ::generic (s/keys :req-un [::target-dir ::overwrite]))

(defn generic
  "Create a repo to manage a generic projects with BigConfig.

  Options:
  - :target-dir  target directory for the template (`generic` is the default)
  - :overwrite   true or :delete (the target directory)

  Example:
    clojure -Tbig-config generic"
  [& {:as args}]
  (run-template ::generic args {:post-process-fn [rename upgrade]
                                :transform [["root"
                                             {"envrc" ".envrc"
                                              "envrc.private" ".envrc.private"
                                              "gitignore" ".gitignore"
                                              "projectile" ".projectile"}
                                             {:tag-open \<
                                              :tag-close \>}]]}))

(comment
  (generic :opts {::bc/env :repl}))

(s/def ::owner non-blank-string?)
(s/def ::repository non-blank-string?)
(s/def ::package (s/keys :req-un [::target-dir ::overwrite ::owner ::repository ::ssh-key]))

(defn data-fn [{:keys [service owner repository] :as data} _ops]
  (let [namespace (format "io.github.%s.%s" owner repository)
        path (str/replace namespace #"\." "/")]
    (-> data
        (assoc :deps (format "io.github.%s/%s" owner repository))
        (assoc :namespace namespace)
        (assoc :path path))))

(defn package
  "Create a BigConfig package.

  Options:
  - :owner       GitHub owner
  - :repository  GitHub repository
  - :ssh-key     Digitalocean ssh-key
  - :target-dir  target directory for the template (`package` is the default)
  - :overwrite   true or :delete (the target directory)

  Example:
    clojure -Tbig-config package"
  [& {:as args}]
  (tap> args)
  (run-template ::package args {:post-process-fn [rename upgrade]
                                :data-fn data-fn
                                :transform [["root"
                                             {"envrc" ".envrc"
                                              "envrc.private" ".envrc.private"
                                              "gitignore" ".gitignore"
                                              "projectile" ".projectile"}
                                             {:tag-open \<
                                              :tag-close \>
                                              :filter-open \<
                                              :filter-close \>}]
                                            ["clj-kondo" ".clj-kondo"]
                                            ["lsp" ".lsp"]
                                            ["env" "env/dev/clj"]
                                            ["src" "src/clj/{{ path }}"]
                                            ["test" "test/clj/{{ path }}"]
                                            ["tofu" "src/resources/{{ path }}/tools/tofu"]
                                            ["ansible" "src/resources/{{ path }}/tools/ansible"]
                                            ["ansible-local" "src/resources/{{ path }}/tools/ansible-local"
                                             {:tag-open \<
                                              :tag-close \>
                                              :filter-open \<
                                              :filter-close \>}]]}))

(comment
  (debug tap-values
    (package :opts {::bc/env :repl}
             :target-dir "../../joe"
             :owner 'amiorin
             :repository 'joe
             :ssh-key '812184))
  (-> tap-values))
