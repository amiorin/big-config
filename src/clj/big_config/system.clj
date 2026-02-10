(ns big-config.system
  (:require
   [babashka.process :as p]
   [big-config :as bc]
   [big-config.core :refer [->workflow]]
   [big-config.run :as run]
   [big-config.step-fns :refer [log-step-fn]]
   [clojure.core.async :as a]
   [clojure.java.io :as io]
   [clojure.string :as str]))

(defn- keywordize [s]
  (-> (str/lower-case s)
      (str/replace "_" "-")
      (str/replace "." "-")
      keyword))

(defn- read-system-env []
  (->> (System/getenv)
       (map (fn [[k v]] [(keywordize k) v]))
       (into {})))

(def env (read-system-env))

(defn destroy-forcibly [proc]
  (when (p/alive? proc)
    (.destroyForcibly ^java.lang.Process (:proc proc)))
  proc)

(defn- re-stream [stream regex & {:keys [timeout]}]
  (let [signal-chan (a/chan (a/dropping-buffer 1))
        ms (or timeout 1000)]
    (a/thread
      (with-open [reader (io/reader stream)]
        (doseq [line (line-seq reader)]
          (binding [*out* *err*]
            (println line)
            (.flush *err*))
          (when (re-find regex line)
            (a/>!! signal-chan line)))))
    (let [[val port] (a/alts!! [signal-chan (a/timeout ms)])]
      (if (= port signal-chan)
        val
        :timeout))))

(defn re-program [cmd regex key opts]
  (let [proc (p/process {:err :out} cmd)
        stream (:out proc)]
    (case (re-stream stream regex {:timeout 500})
      :timeout (if (p/alive? proc)
                 (merge opts {key @(p/destroy-tree proc)
                              ::bc/exit 1
                              ::bc/err (format "regex `%s` not found in `%s`" regex cmd)})
                 (merge opts {key @proc
                              ::bc/exit 1
                              ::bc/err (format "`%s` exit with code `%s` before the timeout" cmd (:exit @proc))}))
      (merge opts {key proc
                   ::bc/exit 0
                   ::bc/err nil}))))

(comment
  (let [cmd #_"bash -c 'exit 1'" "bash -c 'for i in {10..1}; do echo $i; sleep 0.1; done;'"
        regex #"7"]
    (-> (re-program cmd regex ::pg-proc {})
        (update ::stop-fns (fnil conj []) (fn [{:keys [::pg-proc ::pg-data-dir] :as opts}]
                                            (when pg-proc
                                              @(p/destroy-tree pg-proc)
                                              @(destroy-forcibly pg-proc))
                                            (run/generic-cmd :opts opts :cmd (format "rm -rf %s" pg-data-dir))
                                            opts)))))

(defn add-stop-fn [opts f]
  (update opts ::stop-fns (fnil conj []) f))

(defn stop [{:keys [::stop-fns ::async] :as opts}]
  (if async
    (assoc opts ::stop #(run! (fn [stop-fn] (stop-fn opts)) stop-fns))
    (do (run! (fn [stop-fn] (stop-fn opts)) stop-fns)
        opts)))

(defn stop! [system-state]
  (when-let [f (::stop system-state)]
    (f)))

(comment
  (do
    (defn background-process [opts]
      (let [cmd #_"bash -c 'exit 1'" "bash -c 'for i in {10..1}; do echo $i; sleep 0.1; done;'"
            regex #"7"]
        (-> (re-program cmd regex ::proc opts)
            (add-stop-fn (fn [{:keys [::proc] :as opts}]
                           (when proc
                             @(p/destroy-tree proc)
                             @(destroy-forcibly proc))
                           opts)))))
    (def ->system (->workflow {:first-step ::start
                               :wire-fn (fn [step _]
                                          (case step
                                            ::start [background-process ::end]
                                            ::end [stop]))}))
    (into {} [[:sys1 (into (sorted-map) (->system [log-step-fn] {::bc/env :repl}))]
              [:sys2 (let [system (atom (into (sorted-map) (->system [log-step-fn] {::bc/env :repl
                                                                                    ::async true})))]
                       (stop! @system)
                       @system)]])))
