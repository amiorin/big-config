(ns big-config.run
  (:require
   [babashka.process :as process]
   [big-config :as bc]
   [big-config.core :refer [->workflow]]
   [big-config.step-fns :as step-fns]
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
  (let [shell-opts (case env
                     :shell shell-opts
                     :repl (merge shell-opts {:out :string
                                              :err :string}))
        cmd (first cmds)
        proc (process/shell shell-opts cmd)]
    (handle-cmd opts proc)))

(def run-cmds
  (->workflow {:first-step ::run-cmd
               :last-step ::run-cmd
               :wire-fn (fn [step _]
                          (case step
                            ::run-cmd [run-cmd ::run-cmd]
                            ::end [identity]))
               :next-fn (fn [step _ {:keys [::bc/exit ::cmds] :as opts}]
                          (cond
                            (and (seq (rest cmds))
                                 (= exit 0)) [::run-cmd (merge opts {::cmds (rest cmds)})]
                            (= step ::end) [nil opts]
                            :else [::end opts]))}))

(comment)
(defn main []
  (let [step-fns [(fn [f step {:keys [::bc/exit] :as opts}]
                    (println "before " step exit)
                    (let [{:keys [bc/exit] :as opts} (f step opts)]
                      (println "after" step exit)
                      opts))
                  (partial step-fns/exit-step-fn ::wf-end)]
        wf (->workflow {:first-step ::wf-start
                        :last-step ::wf-end
                        :wire-fn (fn [step step-fns]
                                   (case step
                                     ::wf-start [(partial run-cmds step-fns) ::wf-end]
                                     ::wf-end [identity]))})]
    (wf step-fns  {::bc/env :shell
                   ::bc/exit 0
                   ::bc/err nil
                   ::shell-opts {#_#_:dir "tofu"
                                 :extra-env {"FOO" "BAR"}}
                   ::cmds ["false"
                           "bash -c 'echo $FOO'"
                           "echo three"]})))
