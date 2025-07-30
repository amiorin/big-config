(ns big-tofu.core
  (:require
   [clojure.string :as str]
   [selmer.filters :refer [add-filter!]]
   [selmer.parser :as p]))

(defn add-suffix [fqn suffix]
  (let [a-namespace (namespace fqn)
        a-name (name fqn)]
    (keyword a-namespace (str a-name suffix))))

(defn fqn->name [fqn & [c]]
  (let [c (if c c "_")
        sanitize #(str/replace % #"[-\.]" c)
        ns (some-> (namespace fqn)
                   sanitize)
        name (-> (name fqn)
                 sanitize)]
    (str ns (if ns c "") name)))

(defprotocol To
  (reference [this property])
  (construct [this])
  (arn
    [this aws-account-id]
    [this aws-account-id region])
  (root-arn [this]))

(add-filter! :remove-https
             (fn [url]
               (str/replace url #"^https://" "")))

(defrecord Construct [group type fqn block]
  To
  (reference [{:keys [fqn] :as this} property]
    (let [ctx (merge this {:property property
                           :prefix "${"
                           :suffix "}"
                           :name (fqn->name fqn)})]
      (p/render "{{ prefix }}{{ group|name }}.{{ type|name }}.{{ name }}.{{ property|name }}{{ suffix }}" ctx)))
  (construct [{:keys [group type fqn block]}]
    {group {type {(fqn->name fqn) block}}})
  (arn [{:keys [type] :as this} aws-account-id]
    (let [this (assoc this :aws-account-id aws-account-id)]
      (cond
        (and (= group :resource)
             (= type :aws_iam_role)) (p/render "arn:aws:iam::{{ aws-account-id }}:role/{{ block.name }}" this)
        (and (= group :resource)
             (= type :aws_iam_openid_connect_provider)) (p/render "arn:aws:iam::{{ aws-account-id }}:oidc-provider/{{ block.url|remove-https }}" this))))
  (arn [{:keys [type] :as this} aws-account-id region]
    (let [this (-> this
                   (assoc :aws-account-id aws-account-id)
                   (assoc :region region))]
      (cond
        (and (= group :resource)
             (= type :aws_secretsmanager_secret)) (p/render "arn:aws:secretsmanager:{{ region }}:{{ aws-account-id }}:secret/{{ block.name }}" this))))
  (root-arn [{:keys [group type fqn block] :as this}]
    (cond
      (and (= group :data)
           (= type :aws_caller_identity)
           (= fqn :current)
           (= block {}))
      (-> (reference this :account_id)
          (->> (format "arn:aws:iam::%s:root"))))))

(def caller-identity (->Construct :data :aws_caller_identity :current {}))

(comment
  (arn nil nil)
  (let [c (map->Construct {:group :data
                           :type :aws_iam_policy_document
                           :fqn ::foo
                           :block {}})]
    (reference c :json)
    (construct c))
  (-> caller-identity
      root-arn))
