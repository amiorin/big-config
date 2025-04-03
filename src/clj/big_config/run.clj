(ns big-config.run
  (:require
   [babashka.process :as process]
   [big-config :as bc]
   [big-config.core :refer [->workflow ok]]
   [clojure.string :as str]))

(def default-opts {:continue true
                   :out :string
                   :err :string})

(defn handle-cmd [opts proc]
  (let [res (-> (select-keys proc [:exit :out :err :cmd])
                (update-vals (fn [v] (if (string? v)
                                       (str/replace v #"\x1B\[[0-9;]+m" "")
                                       v))))]

    (-> opts
        (update ::bc/procs (fnil conj []) res)
        (merge (-> res
                   (select-keys [:exit :err])
                   (update-keys (fn [k] (keyword "big-config" (name k)))))))))

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

(defn run-cmd [{:keys [::bc/env ::shell-opts ::cmds] :as opts}]
  (let [shell-opts (assoc shell-opts :continue true)
        shell-opts (case env
                     :shell shell-opts
                     :repl (merge shell-opts {:out :string
                                              :err :string}))
        cmd (first cmds)
        proc (process/shell shell-opts cmd)]
    (handle-cmd opts proc)))

(defn push-nil [{:keys [::cmds] :as opts}]
  (let [cmds (if (seq cmds)
               (conj (seq cmds) nil)
               [nil])]
    (-> opts
        (assoc ::cmds cmds)
        ok)))

(def run-cmds
  (->workflow {:first-step ::start
               :wire-fn (fn [step _]
                          (case step
                            ::start [push-nil ::run-cmd]
                            ::run-cmd [run-cmd ::run-cmd]
                            ::end [identity]))
               :next-fn (fn [step _ {:keys [::bc/exit ::cmds] :as opts}]
                          (cond
                            (and (seq (rest cmds))
                                 (or (= exit 0)
                                     (nil? exit))) [::run-cmd (merge opts {::cmds (rest cmds)})]
                            (= step ::end) [nil opts]
                            :else [::end opts]))}))

(comment
  (run-cmds [(fn [f step opts]
               (println step)
               (f step opts))]
            {::bc/env :repl
             ::shell-opts {:continue true
                           :dir "big-infra"
                           :extra-env {"FOO" "BAR"}}
             ::cmds ["bash -c 'echo Error >&2 && exit 1"]}))
