(ns big-config.main
  (:require
   [aero.core :as aero]
   [big-config.git :as git]
   [big-config.lock :as lock]
   [big-config.utils :refer [exit-end-fn generic-cmd println-step-fn
                             recur-ok-or-end run-cmd]]
   [cheshire.core :as json]
   [clojure.string :as str]))

(defn resolve-array [config key xs]
  (assoc config key
         (->> xs
              (map (fn [e] (if (keyword? e) (e config) e)))
              (str/join ""))))

(defn read-module [cmd module profile]
  (let [config (-> (aero/read-config "big-config.edn" {:profile profile})
                   module
                   (assoc :cmd cmd))
        {:keys [run-cmd working-dir]} config
        config (resolve-array config :working-dir working-dir)
        config (resolve-array config :run-cmd run-cmd)]
    config))

(defn git-push [opts]
  (generic-cmd opts "git push"))

(defn run-with-lock
  ([opts]
   (run-with-lock opts identity))
  ([opts end-fn]
   (run-with-lock opts end-fn (fn [_])))
  ([opts end-fn step-fn]
   #_{:clj-kondo/ignore [:loop-without-recur]}
   (loop [step :lock-acquire
          opts opts]
     (step-fn step)
     (let [opts (update opts :steps (fnil conj []) step)]
       (case step
         :lock-acquire (as-> (lock/acquire opts) $
                         (recur-ok-or-end :git-check $ "Failed to acquire the lock"))
         :git-check (as-> (git/check opts) $
                      (recur-ok-or-end :run-cmd $ "The working directory is not clean"))
         :run-cmd (as-> (run-cmd opts) $
                    (recur-ok-or-end :git-push $ "The command executed with the lock failed"))
         :git-push (as-> (git-push opts) $
                     (recur-ok-or-end :lock-release-any-owner $))
         :lock-release-any-owner (as-> (lock/release-any-owner opts) $
                                   (recur-ok-or-end :end $ "Failed to release the lock"))
         :end (end-fn opts))))))

(defn generate-main-tf-json [opts]
  (let [{:keys [fn ns working-dir]} opts
        f (str working-dir "/main.tf.json")]
    (try
      (-> (format "%s/%s" ns fn)
          (symbol)
          requiring-resolve
          (apply (vector opts))
          (json/generate-string {:pretty true})
          (->> (spit f))
          (merge opts {:exit 0
                       :err nil}))
      (catch Exception e
        (merge opts {:exit 1
                     :err (pr-str e)})))))

(defn run
  ([opts]
   (run opts identity))
  ([opts end-fn]
   (run opts end-fn (fn [_])))
  ([opts end-fn step-fn]
   #_{:clj-kondo/ignore [:loop-without-recur]}
   (loop [step :generate-main-tf-json
          opts opts]
     (step-fn step)
     (let [opts (update opts :steps (fnil conj []) step)]
       (case step
         :generate-main-tf-json (as-> (generate-main-tf-json opts) $
                                  (recur-ok-or-end :run-cmd $))
         :run-cmd (as-> (run-cmd opts) $
                    (recur-ok-or-end :end $ "The command executed failed"))
         :end (end-fn opts))))))

(defn ^:export tofu-facade [{[cmd module profile] :args
                             env :env}]
  (as-> (read-module cmd module profile) $
    (assoc $ :env (or env :shell))
    (case cmd
      ("init" "plan") (run $ exit-end-fn println-step-fn)
      "lock" (do (println-step-fn :lock-acquire)
                 (lock/acquire $ (partial exit-end-fn "Failed to acquire the lock")))
      "unlock-any" (do (println-step-fn :lock-release-any-owner)
                       (lock/release-any-owner $))
      ("apply" "destroy") (run-with-lock $ exit-end-fn println-step-fn))))

(comment
  (tofu-facade {:args ["init" :module-a :dev]
                :env :repl}))
