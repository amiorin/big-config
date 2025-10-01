(ns big-config.tools
  (:require
   [big-config :as bc]
   [big-config.render :as render]
   [big-config.step :as step]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]))

(defn stringify
  [args]
  (reduce-kv (fn [a k v]
               (cond
                 (#{:step-fns} k) a
                 (#{:overwrite :opts} k) (assoc a k v)
                 :else (assoc a k (str v)))) {} args))

(def non-blank-string? (s/and string? (complement str/blank?)))
(s/def ::target-dir non-blank-string?)
(def boolean-or-keyword? (s/or :keyword keyword? :boolean boolean?))
(s/def ::overwrite boolean-or-keyword?)
(s/def ::aws-profile non-blank-string?)
(s/def ::region non-blank-string?)
(s/def ::dev non-blank-string?)
(s/def ::prod non-blank-string?)
(s/def ::terraform (s/keys :req-un [::target-dir ::overwrite ::aws-profile ::region ::dev ::prod]))

(defn terraform
  [& {:keys [step-fns] :as args}]
  (let [args (stringify args)
        args (merge {:template "big-config"
                     :target-dir "dist"
                     :overwrite true
                     :transform [["root"
                                  {"projectile" ".projectile"}
                                  {:tag-open \<
                                   :tag-close \>
                                   :filter-open \<
                                   :filter-close \>}]]
                     :opts {::bc/env :shell}}
                    args)
        args (s/conform ::terraform args)
        _ (when (s/invalid? args)
            (throw (ex-info "Invalid input" (s/explain-data ::terraform args))))
        args (update args :overwrite #(second %))
        opts (:opts args)
        template (dissoc args :opts)]
    (if step-fns
      (step/run-steps "render -- big-config terraform"
                      (merge {::render/templates [template]} opts)
                      step-fns)
      (step/run-steps "render -- big-config terraform"
                      (merge {::render/templates [template]} opts)))))

(comment
  (terraform :opts {::bc/env :repl}
             :aws-profile "251213589273"
             :region "eu-west-1"
             :dev "251213589273"
             :prod "251213589273"))

(s/def ::devenv (s/keys :req-un [::target-dir ::overwrite]))

(defn devenv
  [& {:keys [step-fns] :as args}]
  (let [args (stringify args)
        transform ["root"
                   {"envrc" ".envrc"
                    "devenv.nix" "devenv.nix"
                    "devenv.yml" "devenv.yml"}
                   :only
                   :raw]
        args (merge {:template "devenv"
                     :target-dir "."
                     :overwrite true
                     :transform [transform]
                     :opts {::bc/env :shell}}
                    args)
        args (s/conform ::devenv args)
        _ (when (s/invalid? args)
            (throw (ex-info "Invalid input" (s/explain-data ::devenv args))))
        args (update args :overwrite #(second %))
        opts (:opts args)
        template (dissoc args :opts)]
    (if step-fns
      (step/run-steps "render -- big-config devenv"
                      (merge {::render/templates [template]} opts)
                      step-fns)
      (step/run-steps "render -- big-config devenv"
                      (merge {::render/templates [template]} opts)))))

(comment
  (devenv :opts {::bc/env :repl}))
