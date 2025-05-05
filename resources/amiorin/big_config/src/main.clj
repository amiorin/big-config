(ns {{top/ns}}.{{main/ns}}
  (:require
   [aero.core :as aero]
   [babashka.fs :as fs]
   [big-config :as bc]
   [big-config.core :as core]
   [big-config.lock :as lock]
   [big-config.run :as run]
   [big-config.step :as step]
   [big-config.step-fns :as step-fns]
   [cheshire.core :as json]
   [clojure.java.io :as io]
   [{{top/ns}}.user-data :as user-data]
   [org.corfield.new :as new]))

(defn data-fn
  [data]
  data)

(defn template-fn
  [edn {:keys [module] :as _data}]
  (if (#{"alpha" "gamma"} module)
    (merge edn {:root module})
    edn))

(defn render-module [{:keys [profile module target-dir]}]
  (-> module
      (->> (format "{{top/ns}}.%s/render"))
      symbol
      requiring-resolve
      (apply [profile])
      (json/generate-string {:pretty true})
      (->> (spit (format "%s/main.tf.json" target-dir)))))

(defn post-process-fn
  [_edn {:keys [module target-dir] :as data}]
  (cond (#{"alpha"} module) (let [user-data-file (format "%s/files/user_data.sh" target-dir)]
                                 (fs/create-dirs (fs/parent user-data-file))
                                 (-> (user-data/render "{{top/file}}/{{main/file}}/files/user_data.sh")
                                     (->> (spit user-data-file))))
        (#{"beta"} module) (render-module data)))

(defn opts->dir
  [{:keys [::module ::profile]}]
  (format "dist/%s/%s" profile module))

(defn build-fn [{:keys [::module ::profile] :as opts}]
  (binding [*out* (java.io.StringWriter.)]
    (new/create {:template "{{raw-name}}"
                 :name "{{raw-name}}"
                 :target-dir (opts->dir opts)
                 :module module
                 :profile profile
                 :overwrite true}))
  (core/ok opts))

(defn opts-fn [opts]
  (merge opts {::lock/lock-keys [::module ::profile]
               ::run/shell-opts {:dir (opts->dir opts)
                                 :extra-env {"AWS_PROFILE" "{{aws-profile}}"}}}))

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
   (let [opts (-> "{{top/file}}/{{main/file}}/config.edn"
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

(comment)
