(ns big-config.run
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [big-config.utils :as u]
            [clojure.java.io :as io]
            [clojure.string :as str])
  (:import [java.nio.file Files Path]
           [java.io File]
           [java.lang ProcessBuilder$Redirect]))

(def ansi-pattern #"\u001B\[[0-9;]*m")

(defn strip-ansi [s]
  (if (string? s) (str/replace s ansi-pattern "") s))

(defn handle-cmd [opts proc]
  (let [res {:exit (:exit proc)
             :out (strip-ansi (:out proc))
             :err (strip-ansi (:err proc))
             :cmd (:cmd proc)}]
    (assoc opts
           k/procs (conj (vec (get opts k/procs [])) res)
           k/exit (:exit res)
           k/err (:err res))))

(defn- command->argv [cmd]
  (cond
    (nil? cmd) nil
    (vector? cmd) (mapv str cmd)
    (sequential? cmd) (mapv str cmd)
    :else ["bash" "-lc" (str cmd)]))

(defn- stream->string [stream]
  (with-open [r (io/reader stream)]
    (slurp r)))

(defn- write-stdin [proc input]
  (with-open [out (.getOutputStream proc)]
    (when-not (nil? input)
      (cond
        (instance? (Class/forName "[B") input) (.write out ^bytes input)
        :else (.write out (.getBytes (str input) "UTF-8"))))))

(defn default-runner [shell-opts cmd]
  (if (nil? cmd)
    {:exit 0 :out "" :err "" :cmd cmd}
    (let [argv (command->argv cmd)
          pb (ProcessBuilder. ^java.util.List argv)
          cwd (or (:dir shell-opts) (:cwd shell-opts))
          extra-env (or (:extra-env shell-opts) (:extraEnv shell-opts))
          capture-out (not= :inherit (:out shell-opts))
          capture-err (not= :inherit (:err shell-opts))]
      (when cwd (.directory pb (io/file cwd)))
      (when extra-env
        (let [e (.environment pb)]
          (doseq [[ek ev] extra-env]
            (when ev (.put e (name ek) (str ev))))))
      (when-not capture-out (.redirectOutput pb ProcessBuilder$Redirect/INHERIT))
      (when-not capture-err (.redirectError pb ProcessBuilder$Redirect/INHERIT))
      (try
        (let [proc (.start pb)
              out-f (when capture-out (future (stream->string (.getInputStream proc))))
              err-f (when capture-err (future (stream->string (.getErrorStream proc))))]
          (write-stdin proc (:in shell-opts))
          (let [exit (.waitFor proc)]
            {:exit exit
             :out (if out-f @out-f "")
             :err (if err-f @err-f "")
             :cmd cmd}))
        (catch Throwable t
          {:exit 1 :out "" :err (.getMessage t) :cmd cmd})))))

(defonce runner (atom default-runner))

(defn set-runner [next-runner]
  (reset! runner next-runner))

(defn reset-runner []
  (reset! runner default-runner))

(defn with-runner [next-runner f]
  (let [prev @runner]
    (reset! runner next-runner)
    (try
      (f)
      (finally
        (reset! runner prev)))))

(defn generic-cmd [{:keys [opts cmd key shell-opts]}]
  (let [merged-shell-opts (merge {:continue true :out :string :err :string} shell-opts)
        proc (@runner merged-shell-opts cmd)
        next (handle-cmd (or opts {}) proc)]
    (if key
      (assoc next key (str/replace (:out proc) #"\s+$" ""))
      next)))

(defn mktemp-create-dir [opts]
  (let [dir (-> (Files/createTempDirectory "big-config-" (make-array java.nio.file.attribute.FileAttribute 0))
                (.toFile)
                (.getCanonicalPath))
        next (handle-cmd (or opts {}) {:exit 0
                                       :out (str dir "\n")
                                       :err ""
                                       :cmd "bash -c 'readlink -f $(mktemp -d)'"})]
    (assoc next
           k/run-dir dir
           k/run-shell-opts (assoc (get next k/run-shell-opts {}) :dir dir))))

(defn- delete-recursive [file]
  (let [f (io/file file)]
    (when (.exists f)
      (when (.isDirectory f)
        (doseq [child (.listFiles f)]
          (delete-recursive child)))
      (.delete f))))

(defn mktemp-remove-dir [opts]
  (let [dir (get opts k/run-dir)]
    (when (and (string? dir) (seq dir))
      (delete-recursive dir))
    (handle-cmd (or opts {}) {:exit 0 :out "" :err "" :cmd ["rm" "-rf" dir]})))

(defn run-cmd [opts]
  (let [env (get opts k/env)
        base-shell-opts (merge (get opts k/run-shell-opts {}) {:continue true})
        shell-opts (if (or (= env :lib) (= env "lib"))
                     (merge {:out :string :err :string} base-shell-opts)
                     (merge {:out :inherit :err :inherit} base-shell-opts))
        cmds (vec (get opts k/run-cmds []))
        cmd (first cmds)
        proc (@runner shell-opts cmd)]
    (handle-cmd opts proc)))

(defn push-nil [opts]
  (assoc opts
         k/run-cmds (if (seq (get opts k/run-cmds))
                      (vec (cons nil (get opts k/run-cmds)))
                      [nil])
         k/exit 0
         k/err nil))

(def run-cmds
  (core/create-workflow
   {:first-step :big-config.run/start
    :wire-fn (fn [step]
               (case step
                 :big-config.run/start [push-nil k/run-cmd]
                 :big-config.run/run-cmd [run-cmd k/run-cmd]
                 :big-config.run/end [identity nil]
                 [identity nil]))
    :next-fn (fn [step _next-step opts]
               (let [cmds (vec (get opts k/run-cmds []))]
                 (cond
                   (and (seq (rest cmds)) (or (zero? (get opts k/exit 0)) (nil? (get opts k/exit))))
                   [k/run-cmd (assoc opts k/run-cmds (vec (rest cmds)))]

                   (= step :big-config.run/end)
                   [nil opts]

                   :else
                   [:big-config.run/end opts])))}))

(u/register-function 'big-config.run/run-cmd run-cmd)
(u/register-function 'big-config.run/run-cmds run-cmds)
(u/register-function 'big-config.run/mktemp-create-dir mktemp-create-dir)
(u/register-function 'big-config.run/mktemp-remove-dir mktemp-remove-dir)
