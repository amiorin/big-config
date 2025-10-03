(ns multi
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

(defn template-fn
  [{:keys [module]} edn]
  (let [new-transform (case module
                        ("alpha" "gamma") [module]
                        "beta" ['multi/kw->content
                                {:beta "main.tf.json"}
                                :raw])]
    (update edn :transform conj new-transform)))

(defn run-steps [s opts & step-fns]
  (let [{:keys [module profile]} (step/parse-module-and-profile s)
        dir (format "dist/%s/%s" profile module)
        opts (merge opts
                    {::lock/owner (or (System/getenv "ZELLIJ_SESSION_NAME") "CI")
                     ::lock/lock-keys [::step/module ::step/profile]
                     ::run/shell-opts {:dir dir
                                       :extra-env {"AWS_PROFILE" "default"}}
                     ::render/templates [{:template "multi"
                                          :template-fn template-fn
                                          :data-fn 'multi/data-fn
                                          :target-dir dir
                                          :overwrite true
                                          :transform [["common"
                                                       {"projectile" ".projectile"}
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
                            "dev" "111111111111"
                            "prod" "222222222222")}))

(defn kw->content
  [kw {:keys [region aws-account-id] :as data}]
  (case kw
    :beta (let [queues (->> (for [n (range 2)]
                              (create/sqs (add-suffix :alpha/big-sqs (str "-" n))))
                            flatten
                            (map construct))
                kms (->> (create/kms :alpha/big-kms)
                         (map construct))
                bucket (format "tf-state-%s-%s" aws-account-id region)
                provider (create/provider (assoc data :bucket bucket))
                m (->> [provider]
                       (into kms)
                       (into queues)
                       (apply deep-merge)
                       sort-nested-map)]
            (json/generate-string m {:pretty true}))))
