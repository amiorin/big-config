(ns amiorin.big-config
  (:require
   [aero.core :as aero]
   [babashka.process :as p]
   [big-config :as bc]
   [big-config.core :as core]
   [big-config.lock :as lock]
   [big-config.run :as run]
   [big-config.step :as step]
   [big-config.step-fns :as step-fns]
   [clojure.java.io :as io]
   [clojure.string :as str]
   [org.corfield.new :as new]))

(defn data-fn
  [data]
  (let [last-commit (-> (p/shell {:out :string} "git ls-remote https://github.com/amiorin/big-config.git refs/heads/deps-new")
                        :out
                        (str/split #"\s+")
                        first)]
    (assoc data :last-commit last-commit)))

(defn template-fn
  [edn data]
  edn)

(defn post-process-fn
  [edn data])

(defn opts->dir
  [_]
  "..")

(defn build-fn [{:keys [::module ::profile] :as opts}]
  (binding [*out* (java.io.StringWriter.)]
    (new/create {:template "amiorin/big-config"
                 :name "amiorin/big-config"
                 :target-dir (opts->dir opts)
                 :module module
                 :profile profile
                 :overwrite true}))
  (core/ok opts))

(defn opts-fn [opts]
  (merge opts {::lock/lock-keys [::module ::profile]
               ::run/shell-opts {:dir (opts->dir opts)}}))

(defn run-steps
  ([s]
   (run-steps s nil))
  ([s opts]
   (run-steps s [step/print-step-fn
                 (step-fns/->exit-step-fn ::step/end)
                 (step-fns/->print-error-step-fn ::step/end)] opts))
  ([s step-fns opts]
   (apply run-steps step-fns opts (step/parse s)))
  ([step-fns opts steps cmds module profile]
   (let [opts (-> "amiorin/big_config/config.edn"
                  io/resource
                  aero/read-config
                  (merge (or opts {::bc/env :repl})
                         {::step/steps steps
                          ::run/cmds cmds
                          ::module module
                          ::profile profile})
                  opts-fn)
         run-steps (step/->run-steps build-fn)]
     (run-steps step-fns opts))))

(comment
  (run-steps "build -- readme prod"))
