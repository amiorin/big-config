(ns big-config.cli
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [big-config.workflow :as workflow]
            [clojure.java.io :as io])
  (:gen-class))

(defn parse-cli [argv]
  (loop [xs (vec argv)
         args []
         config nil]
    (if (empty? xs)
      {:config config :args args}
      (let [a (first xs)]
        (if (contains? #{"--config" "-c"} a)
          (recur (subvec xs 2) args (second xs))
          (recur (subvec xs 1) (conj args a) config))))))

(defn- print-error-step-fn [end]
  (core/create-step-fn
   {:before-f (fn [step opts]
                (let [err (get opts k/err)
                      exit (get opts k/exit)]
                  (when (and (= step end) (pos? (or exit 0)) (string? err) (seq (.trim err)))
                    (binding [*out* *err*]
                      (println "✖" err)))))}))

(defn- default-step-fns []
  [workflow/print-step-fn
   (print-error-step-fn :big-config.workflow/end)])

(defn- run-config-value [loaded args]
  (let [base-opts (merge {k/env :shell}
                         (or (:opts loaded) (when (and (map? loaded) (not (:opts loaded))) loaded) {}))]
    (cond
      (fn? loaded)
      (try
        (or (loaded args) {k/exit 0})
        (catch clojure.lang.ArityException _
          (or (loaded (default-step-fns) (merge base-opts (workflow/parse-args args))) {k/exit 0})))

      (and (map? loaded) (fn? (:main loaded)))
      ((:main loaded) (default-step-fns) (merge base-opts (workflow/parse-args args)))

      :else
      (workflow/run-steps (default-step-fns) (merge base-opts (workflow/parse-args args))))))

(defn run-with-config [config-path args]
  (let [full (.getCanonicalPath (io/file config-path))]
    (when-not (.exists (io/file full))
      (throw (ex-info (str "Config file not found: " full) {:config full})))
    (run-config-value (load-file full) args)))

(defn -main [& argv]
  (try
    (let [{:keys [config args]} (parse-cli argv)
          result (if config
                   (run-with-config config args)
                   (workflow/run-steps (default-step-fns) (merge {k/env :shell} (workflow/parse-args args))))
          exit (if (integer? (get result k/exit)) (get result k/exit) 0)]
      (System/exit exit))
    (catch Throwable t
      (binding [*out* *err*]
        (println (or (.getMessage t) (str t))))
      (System/exit 1))))
