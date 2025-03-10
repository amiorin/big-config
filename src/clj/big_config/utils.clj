(ns big-config.utils
  (:require
   [babashka.process :as process]
   [clojure.string :as str]
   [com.bunimo.clansi :as clansi :refer [style]]))

(defn exit-with-code [n]
  (shutdown-agents)
  (flush)
  (System/exit n))

(defn handle-last-cmd [opts]
  (let [{:keys [cmd-results]} opts]
    (last cmd-results)))

(defmacro recur-ok-or-end
  ([key opts]
   `(recur-ok-or-end ~key ~opts nil))
  ([key opts msg]
   `(let [exit# (:exit ~opts)
          err# (:err ~opts)
          msg# (if ~msg
                 ~msg
                 err#)]
      (if (= exit# 0)
        (recur ~key ~opts)
        (recur :end (assoc ~opts :err msg#))))))

(defmacro recur-not-ok-or-end [key opts]
  `(let [proc# (handle-last-cmd ~opts)
         exit# (get proc# :exit)]
     (if (= exit# 0)
       (recur :end ~opts)
       (recur ~key ~opts))))

(def default-opts {:continue true
                   :out :string
                   :err :string})

(defn handle-cmd [opts proc]
  (let [{:keys [exit err]} proc
        res (select-keys proc [:exit :out :err :cmd])]
    (-> opts
        (update :cmd-results (fnil conj []) res)
        (merge {:exit exit :err err}))))

(defn generic-cmd
  ([opts cmd]
   (let [proc (process/shell default-opts cmd)]
     (handle-cmd opts proc)))
  ([opts cmd key]
   (let [proc (process/shell default-opts cmd)]
     (-> opts
         (assoc key (-> (:out proc)
                        str/trim-newline))
         (handle-cmd proc)))))

(defn deep-merge
  "Recursively merges maps."
  [& maps]
  (letfn [(m [& xs]
            (if (some #(and (map? %) (not (record? %))) xs)
              (apply merge-with m xs)
              (last xs)))]
    (reduce m maps)))

(defn nested-sort-map [m]
  (cond
    (map? m) (into (sorted-map)
                   (for [[k v] m]
                     [k (cond
                          (map? v) (nested-sort-map v)
                          (vector? v) (mapv nested-sort-map v)
                          :else v)]))
    (vector? m) (mapv nested-sort-map m)
    :else m))

(defn step->message [step]
  (let [messages {:lock-release-any-owner "Releasing lock"
                  :git-check "Checking if there are files not in the index"
                  :run-cmd "Running the command with the lock"
                  :git-push "Pushing the changes to git"
                  :lock-acquire "Acquiring lock"}]
    (as-> step $
      (get messages $)
      (clansi/style $ :green))))

(defn println-step-fn [step]
  (when (not= :end step)
    (println (step->message step))))

(defn print-and-flush
  [res]
  (println res)
  (flush))

(defn run-cmd [opts]
  (let [{:keys [run-cmd]} opts
        proc (process/shell {:continue true} run-cmd)]
    (handle-cmd opts proc)))

(defn exit-end-fn
  ([opts]
   (exit-end-fn nil opts))
  ([err-msg opts]
   (let [{:keys [exit env err]} opts
         err (or err-msg err)]
     (when-not (= exit 0)
       (println (style err :red)))
     (case env
       :shell (exit-with-code exit)
       :repl opts))))

(comment)
