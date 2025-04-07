(ns big-tofu.core
  (:require
   [clojure.string :as str]
   [selmer.parser :as p]))

(defn ^:export add-suffix [fqn suffix]
  (let [a-namespace (namespace fqn)
        a-name (name fqn)]
    (keyword a-namespace (str a-name suffix))))

(defn fqn->name [fqn]
  (let [sanitize #(str/replace % #"[-\.]" "_")
        ns (some-> (namespace fqn)
                   sanitize)
        name (-> (name fqn)
                 sanitize)]
    (str ns (if ns "_" "") name)))

(defprotocol To
  (reference [this property])
  (construct [this])
  (root-arn [this]))

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
  (let [c (map->Construct {:group :data
                           :type :aws_iam_policy_document
                           :fqn ::foo
                           :block {}})]
    (reference c :json)
    (construct c))
  (-> caller-identity
      root-arn))
