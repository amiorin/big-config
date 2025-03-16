(ns big-config.run
  (:require
   [big-config :as bc]
   [big-config.lock :as lock]
   [big-config.utils :refer [choice default-step-fn run-cmd]]
   [cheshire.core :as json]))

(defn generate-main-tf-json [opts]
  (let [{:keys [::bc/test-mode ::lock/fn ::lock/ns ::lock/working-dir]} opts
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
