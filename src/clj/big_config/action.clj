(ns big-config.action
  (:require
   [big-config.core :refer [->workflow choice]]
   [big-config.git :as git]
   [big-config.lock :as lock]
   [big-config.run :as run :refer [generic-cmd]]
   [big-config.unlock :as unlock]))

(defn git-push [opts]
  (generic-cmd :opts opts
               :cmd "git push"))

(defn run-action-with-lock [action step-fns opts]
  (let [wf (->workflow {:first-step ::check
                        :wire-fn (fn [step step-fns]
                                   (case step
                                     ::check [(partial git/check step-fns) ::lock]
                                     ::lock [(partial lock/lock step-fns) ::run-cmds]
                                     ::run-cmds [(partial run/run-cmds step-fns) ::push]
                                     ::push [git-push ::unlock]
                                     ::unlock [(partial unlock/unlock-any step-fns) ::end]
                                     ::end [identity]))
                        :next-fn (fn [step next-step opts]
                                   (cond
                                     (= step ::end) [nil opts]
                                     (and (= step ::run-cmds)
                                          (#{:ci :auto-apply} action)) [::unlock opts]
                                     :else (choice {:on-success next-step
                                                    :on-failure ::end
                                                    :opts opts})))})]
    (wf step-fns opts)))
