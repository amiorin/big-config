(ns big-config.run
  (:require
   [big-config :as bc]
   [big-config.core :refer [->workflow run-cmd]]
   [cheshire.core :as json]))

(defn generate-main-tf-json [opts]
  (let [{:keys [::bc/test-mode :big-config.tofu/fn :big-config.tofu/ns ::working-dir]} opts
        f (str working-dir "/main.tf.json")]
    (if test-mode
      (merge opts {::bc/exit 0
                   ::bc/err nil})
      (try
        (-> (format "%s/%s" ns fn)
            (symbol)
            requiring-resolve
            (apply (vector opts))
            (json/generate-string {:pretty true})
            (->> (spit f))
            (merge opts {::bc/exit 0
                         ::bc/err nil}))
        (catch Exception e
          (merge opts {::bc/exit 1
                       ::bc/err (pr-str e)}))))))

(def run (->workflow {:first-step ::generate-main-tf-json
                      :wire-fn (fn [step _]
                                 (case step
                                   ::generate-main-tf-json [generate-main-tf-json ::run-cmd]
                                   ::run-cmd [run-cmd ::end]
                                   ::end [identity nil]))}))

(comment
  (->> (run #:big-config.lock {:aws-account-id "111111111111"
                               :region "eu-west-1"
                               :ns "test.module"
                               :fn "invoke"
                               :owner "CI"
                               :lock-keys [:big-config.lock/aws-account-id
                                           :big-config.lock/region
                                           :big-config.lock/ns]
                               :big-config.run/run-cmd "true"
                               :big-config/test-mode true
                               :big-config/env :repl})
       (into (sorted-map))))
