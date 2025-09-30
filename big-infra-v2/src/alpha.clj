(ns alpha
  (:require
   [big-config :as bc]
   [big-config.lock :as lock]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.step :as step]
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [add-suffix construct]]
   [big-tofu.create :as create]
   [cheshire.core :as json]))

(defn run-steps [s opts & step-fns]
  (let [{:keys [module profile]} (step/parse-module-and-profile s)
        dir (format "dist/%s/%s" profile module)
        opts (merge opts
                    {::lock/owner (or (System/getenv "ZELLIJ_SESSION_NAME") "CI")
                     ::lock/lock-keys [::step/module ::step/profile]
                     ::run/shell-opts {:dir dir
                                       :extra-env {"AWS_PROFILE" "251213589273"}}
                     ::render/templates [{:template "alpha"
                                          :target-dir dir
                                          :overwrite true
                                          :data-fn 'alpha/data-fn
                                          :transform [['alpha/kw->content
                                                       {:alpha "main.tf.json"}
                                                       :raw]]}]})]
    (if step-fns
      (apply step/run-steps s opts step-fns)
      (step/run-steps s opts))))

(comment
  (run-steps "render -- alpha prod" {::bc/env :repl}))

(defn data-fn
  [{:keys [profile] :as data} _]
  (merge data
         {:region "eu-west-1"
          :aws-account-id (case profile
                            "dev" "251213589273"
                            "prod" "251213589273")}))

(defn kw->content
  [kw data]
  (case kw
    :alpha (let [queues (->> (for [n (range 2)]
                               (create/sqs (add-suffix :alpha/big-sqs (str "-" n))))
                             flatten
                             (map construct))
                 kms (->> (create/kms :alpha/big-kms)
                          (map construct))
                 provider (create/provider (assoc data :bucket "tf-state-251213589273-eu-west-1"))
                 m (->> [provider]
                        (into kms)
                        (into queues)
                        (apply deep-merge)
                        sort-nested-map)]
             (json/generate-string m {:pretty true}))))
