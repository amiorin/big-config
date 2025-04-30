(ns big-config.step
  (:require
   [big-config :as bc]
   [big-config.action :as action]
   [big-config.build :as build]
   [big-config.core :as core]
   [big-config.git :as git]
   [big-config.lock :as lock]
   [big-config.run :as run]
   [big-config.unlock :as unlock]
   [bling.core :refer [bling]]
   [selmer.parser :as parser]
   [selmer.util :as util]))

(def print-step-fn
  (core/->step-fn {:before-f (fn [step {:keys [::bc/exit] :as opts}]
                               (binding [util/*escape-variables* false]
                                 (let [[lock-start-step] (lock/lock)
                                       [unlock-start-step] (unlock/unlock-any)
                                       [check-start-step] (git/check)
                                       [build-start-step] ((build/->build (fn [])))
                                       [prefix color] (if (and exit
                                                               (not= exit 0))
                                                        ["\uf05c" :red.bold]
                                                        ["\ueabc" :green.bold])
                                       msg (cond
                                             (= step lock-start-step) (parser/render "Lock (owner {{ big-config..lock/owner }})" opts)
                                             (= step unlock-start-step) "Unlock any"
                                             (= step check-start-step) "Checking if the working directory is clean"
                                             (= step build-start-step) "Building:"
                                             (= step ::run/run-cmd) (parser/render "Running:\n> {{ big-config..run/cmds | first}}" opts)
                                             :else nil)]
                                   (when msg
                                     (binding [*out* *err*]
                                       (println (bling [color (parser/render (str "{{ prefix }} " msg) {:prefix prefix})])))))))
                   :after-f (fn [step {:keys [::bc/exit] :as opts}]
                              (let [[_ check-end-step] (git/check)
                                    prefix "\uf05c"
                                    msg (cond
                                          (= step check-end-step) "Working directory is NOT clean"
                                          (= step ::run/run-cmd) (parser/render "Failed running:\n> {{ big-config..run/cmds | first }}" opts)
                                          :else nil)]
                                (when (and msg
                                           (> exit 0))
                                  (binding [*out* *err*]
                                    (println (bling [:red.bold (parser/render (str "{{ prefix }} " msg) {:prefix prefix})]))))))}))

(defn run-step
  [build-fn step-fns {:keys [::steps] :as opts}]
  (loop [steps (map keyword steps)
         opts opts]
    (let [{:keys [::bc/exit] :as opts} (case (first steps)
                                         :lock (lock/lock step-fns opts)
                                         :git-check (git/check step-fns opts)
                                         :build ((build/->build build-fn) step-fns opts)
                                         :exec (run/run-cmds step-fns opts)
                                         :git-push (action/git-push opts)
                                         :unlock-any (unlock/unlock-any step-fns opts))]
      (cond
        (and (seq (rest steps))
             (or (= exit 0)
                 (nil? exit))) (recur (rest steps) opts)
        :else opts))))

(defn ->run-steps [build-fn]
  (core/->workflow {:first-step ::start
                    :wire-fn (fn [step step-fns]
                               (case step
                                 ::start [(partial run-step build-fn step-fns) ::end]
                                 ::end [identity]))}))
