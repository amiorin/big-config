(ns big-config.tools
  (:require
   [big-config :as bc]
   [big-config.render :as render]
   [big-config.step :as step]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [babashka.fs :as fs]))

(def non-blank-string? (s/and string? (complement str/blank?)))
(s/def ::target-dir non-blank-string?)
(def boolean-or-keyword? (s/or :keyword keyword? :boolean boolean?))
(s/def ::overwrite boolean-or-keyword?)
(s/def ::aws-profile non-blank-string?)
(s/def ::region non-blank-string?)
(s/def ::dev non-blank-string?)
(s/def ::prod non-blank-string?)

(defn rename
  [{:keys [target-dir]} _]
  (fs/walk-file-tree target-dir
                     {:visit-file
                      (fn
                        [path _]
                        (let [path (str path)]
                          (when (str/ends-with? path ".source")
                            (fs/move path (str/replace path #".source$"  "") {:replace-existing true})))
                        :continue)}))

(defn stringify
  [args]
  (reduce-kv (fn [a k v]
               (cond
                 (#{:step-fns} k) a
                 (#{:overwrite :opts} k) (assoc a k v)
                 :else (assoc a k (str v)))) {} args))

(defn prepare
  [args defaults]
  (let [args (stringify args)]
    (merge defaults args)))

(defn args->opts
  [args spec]
  (let [args (s/conform spec args)
        _ (when (s/invalid? args)
            (throw (ex-info "Invalid input" (s/explain-data spec args))))
        args (update args :overwrite #(second %))
        opts (:opts args)
        template (dissoc args :opts)]
    [opts template]))

(defn run-template
  [spec {:keys [step-fns] :as args} defaults]
  (let [s (format "render -- big-config %s" (name spec))
        args (prepare args defaults)
        [opts template] (args->opts args spec)]
    (if step-fns
      (step/run-steps s (merge {::render/templates [template]} opts) step-fns)
      (step/run-steps s (merge {::render/templates [template]} opts)))))

(s/def ::terraform (s/keys :req-un [::target-dir ::overwrite ::aws-profile ::region ::dev ::prod]))

(defn terraform
  [& {:keys [step-fns] :as args}]
  (run-template ::terraform args {:template "big-config"
                                  :target-dir "dist"
                                  :overwrite true
                                  :post-process-fn rename
                                  :transform [["root"
                                               {"projectile" ".projectile"}
                                               {:tag-open \<
                                                :tag-close \>
                                                :filter-open \<
                                                :filter-close \>}]]
                                  :opts {::bc/env :shell}}))

(comment
  (terraform :opts {::bc/env :repl}
             :aws-profile "251213589273"
             :region "eu-west-1"
             :dev "251213589273"
             :prod "251213589273"))

(s/def ::devenv (s/keys :req-un [::target-dir ::overwrite]))

(defn devenv
  [& {:keys [step-fns] :as args}]
  (run-template ::devenv args {:template "devenv"
                               :target-dir "."
                               :overwrite true
                               :transform [["root"
                                            {"envrc" ".envrc"
                                             "devenv.nix" "devenv.nix"
                                             "devenv.yml" "devenv.yml"}
                                            :only
                                            :raw]]
                               :opts {::bc/env :shell}}))

(comment
  (devenv :opts {::bc/env :repl}))
