(ns big-config.call
  (:require
   [big-config :as bc]
   [big-config.core :refer [->workflow]]
   [cheshire.core :as json]))

(defn call-fn [{:keys [::fns] :as opts}]
  (let [{:keys [f args]} (first fns)]
    (-> (symbol f)
        requiring-resolve
        (apply args))
    (merge opts {::bc/exit 0
                 ::bc/err nil})))

(def call-fns
  (->workflow {:first-step ::call-fn
               :last-step ::call-fn
               :wire-fn (constantly [call-fn ::call-fn])
               :next-fn (fn [_ _ {:keys [::fns] :as opts}]
                          (if (seq (rest fns))
                            [::call-fn (merge opts {::fns (rest fns)})]
                            [nil opts]))}))

(defn ^:export spit-json [{:keys [out f args]}]
  (-> (symbol f)
      requiring-resolve
      (apply args)
      (json/generate-string {:pretty true})
      (->> (spit out))))

(comment
  (call-fns [(fn [f step opts]
               (println step)
               (f step opts))]
            {::fns [{:f "big-config.call/spit-json"
                     :desc "spit main.tf.json"
                     :args [{:out "big-infra/tofu/251213589273/alpha/main.tf.json"
                             :f "tofu.alpha.main/invoke"
                             :args [{:aws-account-id "251213589273"
                                     :region "eu-west-1"
                                     :module :alpha}]}]}]}))
