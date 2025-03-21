(ns big-config.run-with-lock
  (:require
   [big-config.core :refer [->workflow git-push run-cmd]]
   [big-config.git :refer [check]]
   [big-config.lock :refer [lock]]
   [big-config.run :as run :refer [generate-main-tf-json]]
   [big-config.unlock :refer [unlock-any]]))

(def run-with-lock (->workflow {:first-step ::lock-acquire
                                :wire-fn (fn [step step-fns]
                                           (case step
                                             ::lock-acquire [(partial lock step-fns) ::git-check "Failed to acquire the lock"]
                                             ::git-check [(partial check step-fns) ::generate-main-tf-json "The working directory is not clean"]
                                             ::generate-main-tf-json [generate-main-tf-json ::run-cmd]
                                             ::run-cmd [run-cmd ::git-push "The command executed with the lock failed"]
                                             ::git-push [git-push ::lock-release-any-owner]
                                             ::lock-release-any-owner [(partial unlock-any step-fns) ::end "Failed to release the lock"]
                                             ::end [identity]))}))

(comment
  (->> (run-with-lock #:big-config.lock {:aws-account-id "111111111111"
                                         :region "eu-west-1"
                                         :ns "test.module"
                                         :fn "invoke"
                                         :owner "CI"
                                         :lock-keys [:big-config.lock/aws-account-id
                                                     :big-config.lock/region
                                                     :big-config.lock/ns]
                                         :big-config.run/cmd :destroy
                                         :big-config.aero/module :prod
                                         :big-config.run/run-cmd "true"
                                         :big-config/test-mode true
                                         :big-config/env :repl})
       (into (sorted-map))))
