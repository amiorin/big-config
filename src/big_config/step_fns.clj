(ns big-config.step-fns
  (:require [big-config.core :as core]
            [big-config.keys :as k]
            [big-config.utils :as u]
            [clojure.java.io :as io])
  (:import [java.nio.file Files]))

(defn exit-with-code [n]
  (System/exit (int n)))

(defn create-exit-step-fn [end]
  (core/create-step-fn
   {:after-f (fn [step opts]
               (when (and (= step end) (not (#{:repl "repl"} (get opts k/env))))
                 (exit-with-code (get opts k/exit 0))))}))

(def ->exit-step-fn create-exit-step-fn)

(defn create-print-error-step-fn [end]
  (core/create-step-fn
   {:before-f (fn [step opts]
                (let [err (get opts k/err)
                      exit (get opts k/exit)]
                  (when (and (= step end) (pos? (or exit 0)))
                    (binding [*out* *err*]
                      (when (and (string? err) (seq (.trim err)))
                        (println "✖" err))
                      (let [stack (get opts k/stack-trace)]
                        (when (and (string? stack) (seq (.trim stack)))
                          (let [dir (.toFile (Files/createTempDirectory "big-config-" (make-array java.nio.file.attribute.FileAttribute 0)))
                                file (io/file dir "stack-trace.txt")]
                            (spit file stack)
                            (println "\nThe stack-trace has been written to" (.getPath file)))))))))}))

(def ->print-error-step-fn create-print-error-step-fn)

(defonce taps (atom []))

(def tap-step-fn
  (core/create-step-fn
   {:before-f (fn [step opts] (swap! taps conj [step :before opts]))
    :after-f (fn [step opts] (swap! taps conj [step :after opts]))}))

(defn log-step-fn [f step opts]
  (f step (assoc opts k/steps-trace (conj (vec (get opts k/steps-trace [])) step))))

(def bling-step-fn
  (core/create-step-fn
   {:before-f (fn [step _opts]
                (binding [*out* *err*]
                  (println "➜" step)))
    :after-f (fn [step opts]
               (when (pos? (get opts k/exit 0))
                 (binding [*out* *err*]
                   (println "✖" (str step ":") (or (get opts k/err) "")))))}))

(u/register-function 'big-config.step-fns/tap-step-fn tap-step-fn)
(u/register-function 'big-config.step-fns/log-step-fn log-step-fn)
(u/register-function 'big-config.step-fns/bling-step-fn bling-step-fn)
