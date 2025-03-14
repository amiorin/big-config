(ns big-config.run-with-lock
  (:require
   [big-config.git :as git]
   [big-config.lock :as lock]
   [big-config.utils :refer [choice default-step-fn git-push run-cmd]]))

(defn run-with-lock
  ([opts]
   (run-with-lock default-step-fn opts))
  ([step-fn opts]
   #_{:clj-kondo/ignore [:loop-without-recur]}
   (loop [step ::lock-acquire
          opts opts]
     (let [[f next-step errmsg] (case step
                                  ::lock-acquire [(partial lock/lock step-fn) ::git-check "Failed to acquire the lock"]
                                  ::git-check [(partial git/check step-fn) ::run-cmd "The working directory is not clean"]
                                  ::run-cmd [run-cmd ::git-push "The command executed with the lock failed"]
                                  ::git-push [git-push ::lock-release-any-owner nil]
                                  ::lock-release-any-owner [(partial lock/unlock-any step-fn) ::end "Failed to release the lock"]
                                  ::end [identity nil])]
       (as-> (step-fn {:f f
                       :step step
                       :opts opts}) $
         (if next-step
           (choice {:on-success next-step
                    :on-failure ::end
                    :errmsg errmsg
                    :opts $})
           $))))))
