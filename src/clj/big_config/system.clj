(ns big-config.system
  "An alternative to Integrant to create a `system` using `big-config.core/->workflow`."
  (:require
   [babashka.process :as p]
   [big-config :as bc]
   [big-config.core :refer [->workflow]]
   [big-config.step-fns :refer [log-step-fn]]
   [big-config.utils :refer [assert-args-present]]
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

(def
  ^{:doc "Map of the environment variables keywordized. All `_` are transformed
  to `-`. All `.` are transformed to `-`. All evironment variables are
  lowercased.
  Example

  ```clojure
  (env :path)
  ```"
    :arglists '([key default-value])}
  env (read-system-env))

(comment
  (env :path))

(defn destroy!
  "Destroy a `babashka.process/process`.

  Example:

  ```clojure
  (add-stop-fn opts (fn [{:keys [::proc] :as opts}]
                      (when proc
                        (destroy! proc kill-timeout))))
  ```"
  [proc & [timeout]]
  (p/destroy proc)
  (when (= (deref proc (or timeout 1000) :timeout) :timeout)
    (.destroyForcibly ^java.lang.Process (:proc proc)))
  @proc)

(defn re-process
  "Creates a child process and blocks until `:timeout` or the `:regex` is
  found. `re-opts` is pass to `babashka.process/process`.

  Supported options in `re-opts`:
   - all `babashka.process/process` options.
   - `:cmd`: like `babashka.process/process`. By default is to redirect `:err` to `:out`.
   - `:regex`: the regex to match from either `:std` or `:err` or both of the process.
   - `:key`: the key used to store the process created when returning `opts`.
   - `:capture`: either `:err` or `:out`. By default is `:out`.
   - `:line-fn`: a function to do something with every line. By default it prints to `*err*` and it flushes it.
   - `:timeout`: the timeout for finding the `:regex`. By default is 1 second.
   - `:kill-timeout`: the timeout for invoking `destroy!`. By default is 1 second.

  Example of `re-process`

  ```clojure
  (defn background-process [opts]
    (let [re-opts (into {} [[:cmd cmd ]
                            [:regex regex]
                            [:timeout 1000]
                            [:key ::proc]])
          opts (re-process re-opts opts)]
      (add-stop-fn opts (fn [{:keys [::proc] :as opts}]
                          (when proc
                            (destroy! proc 1000))))))
  ```"
  {:arglists '([re-opts opts])}
  [{:keys [cmd regex key capture line-fn timeout kill-timeout] :as re-opts} opts]
  (assert-args-present re-opts opts cmd regex key)
  (let [proc (p/process (merge {:err :out} re-opts) cmd)
        stream ((or capture :out) proc)
        line-fn (or line-fn #(binding [*out* *err*]
                               (println %)
                               (.flush *err*)))
        re-stream (let [signal-chan (a/chan (a/dropping-buffer 1))
                        ms (or timeout 1000)]
                    (a/thread
                      (with-open [reader (io/reader stream)]
                        (doseq [line (line-seq reader)]
                          (line-fn line)
                          (when (re-find regex line)
                            (a/>!! signal-chan line)))))
                    (let [[val port] (a/alts!! [signal-chan (a/timeout ms)])]
                      (if (= port signal-chan)
                        val
                        :timeout)))]
    (case re-stream
      :timeout (if (p/alive? proc)
                 (merge opts {key (destroy! proc (or kill-timeout 1000))
                              ::bc/exit 1
                              ::bc/err (format "regex `%s` not found in `%s` before the timeout" regex cmd)})
                 (merge opts {key @proc
                              ::bc/exit 1
                              ::bc/err (format "`%s` exits with code `%s` before the timeout" cmd (:exit @proc))}))
      (merge opts {key proc
                   ::bc/exit 0
                   ::bc/err nil}))))

(defn add-stop-fn
  "It returns `opts` but `f` does not return `opts`. While Integrant has an
  `init-key` and an `halt-key`, here you have only a `step` and `add-stop-fn`
  that adds a `f` for future invocations to halt the pending resources.

  Example:

  ```clojure
  (defn background-process [opts]
    (let [re-opts (into {} [[:cmd cmd ]
                            [:regex regex]
                            [:timeout 1000]
                            [:key ::proc]])
          opts (re-process re-opts opts)]
      (add-stop-fn opts (fn [{:keys [::proc] :as opts}]
                          (when proc
                            (destroy! proc 1000))))))
  ```"
  [opts f]
  (update opts ::stop-fns (fnil conj []) f))

(defn stop
  "it returns the same version of `opts` that it has received. To be used in the
  `:wire-fn` with the last step.

  Example:

  ```clojure
  (->workflow {:first-step ::start
               :wire-fn (fn [step _]
                          (case step
                            ::start [background-process ::end]
                            ::end [stop]))})
  ```"
  {:arglists '([opts])}
  [{:keys [::stop-fns ::async] :as opts}]
  (if async
    (assoc opts ::stop #(run! (fn [stop-fn] (stop-fn opts)) stop-fns))
    (do (run! (fn [stop-fn] (stop-fn opts)) stop-fns)
        opts)))

(defn stop!
  "it stops a `system` created with `:async true`."
  [system]
  (when-let [f (::stop system)]
    (f)))

(comment
  (let [kill-timeout 150
        shutdown-timeout 100
        clj-timeout 3000]
    (defn background-process [opts]
      (let [re-opts (into {} [[:cmd (format "clj -X big-config.system/main :shutdown-timeout %s" shutdown-timeout)]
                              [:regex #"token"]
                              [:timeout clj-timeout]
                              [:key ::proc]])
            opts (re-process re-opts opts)]
        (add-stop-fn opts (fn [{:keys [::proc] :as opts}]
                            (when proc
                              (destroy! proc kill-timeout))))))
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

(defn ^:private test-bb
  "kill-timeout 50 -> signal 15 and then signal 9 -> exit 137
  kill-timeout 200 -> signal 15 -> exit 143"
  []
  (let [kill-timeout 50
        shutdown-timeout 100
        clj-timeout 3000
        background-process (fn [opts]
                             (let [re-opts (into {} [[:cmd (format "clj -X big-config.system/main :shutdown-timeout %s" shutdown-timeout)]
                                                     [:regex #"token"]
                                                     [:timeout clj-timeout]
                                                     [:key ::proc]])
                                   opts (re-process re-opts opts)]
                               (add-stop-fn opts (fn [{:keys [::proc] :as opts}]
                                                   (when proc
                                                     (destroy! proc kill-timeout))))))
        ->system (->workflow {:first-step ::start
                              :wire-fn (fn [step _]
                                         (case step
                                           ::start [background-process ::end]
                                           ::end [stop]))})]

    (println (into {} [[:exit1 (-> (into (sorted-map) (->system [log-step-fn] {::bc/env :repl}))
                                   ::proc
                                   deref
                                   :exit)]
                       [:exit2 (let [system (atom (into (sorted-map) (->system [log-step-fn] {::bc/env :repl
                                                                                              ::async true})))]
                                 (stop! @system)
                                 (-> @system
                                     ::proc
                                     deref
                                     :exit))]]))))

(comment
  (test-bb))

(defn ^:private main
  "The :out and :err of the hook are not captured by the REPL"
  [& {:keys [shutdown-timeout]}]
  (assert shutdown-timeout)
  (.addShutdownHook (Runtime/getRuntime)
                    (Thread. (fn []
                               (println "\n[Shutdown Hook] Cleaning up resources before exit...")
                               (Thread/sleep shutdown-timeout))))
  (println "Script is running... (Press Ctrl+C to test)")
  (println "token")
  @(promise))
