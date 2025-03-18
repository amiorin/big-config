(ns big-config.run
  (:require
   [big-config :as bc]
   [big-config.tofu :as tofu]
   [big-config.utils :refer [choice default-step-fn run-cmd]]
   [cheshire.core :as json]))

(defn generate-main-tf-json [opts]
  (let [{:keys [::bc/test-mode ::tofu/fn ::tofu/ns ::working-dir]} opts
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

(defn run
  ([opts]
   (run default-step-fn opts))
  ([step-fn opts]
   #_{:clj-kondo/ignore [:loop-without-recur]}
   (loop [step ::generate-main-tf-json
          opts opts]
     (let [[f next-step] (case step
                           ::generate-main-tf-json [generate-main-tf-json ::run-cmd]
                           ::run-cmd [run-cmd ::end]
                           ::end [identity nil])]
       (as-> (step-fn {:f f
                       :step step
                       :opts opts}) $
         (if next-step
           (choice {:on-success next-step
                    :on-failure ::end
                    :opts $})
           $))))))

(comment
  (run #:big-config.lock {:aws-account-id "111111111111"
                          :region "eu-west-1"
                          :ns "test.module"
                          :fn "invoke"
                          :owner "CI"
                          :lock-keys [:big-config.lock/aws-account-id
                                      :big-config.lock/region
                                      :big-config.lock/ns]
                          :big-config.run/run-cmd "true"
                          :big-config/test-mode true
                          :big-config/env :repl}))
