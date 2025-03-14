(ns big-config.msg
  (:require
   [big-config.run :as run]
   [big-config.run-with-lock :as rwl]
   [com.bunimo.clansi :as clansi]))

(defn step->message [step]
  (let [messages {::run/generate-main-tf-json "Generating the main.tf.json file"
                  ::run/run-cmd "Running the tofu command"
                  ::rwl/lock-acquire "Acquiring lock"
                  ::rwl/git-check "Checking if there are files not in the index"
                  ::rwl/run-cmd "Running the tofu command"
                  ::rwl/git-push "Pushing the changes to git"
                  ::rwl/lock-release-any-owner "Releasing lock"}
        msg (step messages)]
    (when msg
      (clansi/style msg :green))))

(defn println-step-fn
  ([step]
   (println-step-fn step nil))
  ([step _opts]
   (when (not= :end step)
     (println (step->message step)))))
