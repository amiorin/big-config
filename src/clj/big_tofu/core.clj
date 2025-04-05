(ns big-tofu.core
  (:require
   [clojure.string :as str]
   [selmer.parser :as p]))

(defn fqn->name [fqn]
  (let [sanitize #(str/replace % #"[-\.]" "_")
        ns (some-> (namespace fqn)
                   sanitize)
        name (-> (name fqn)
                 sanitize)]
    (str ns (if ns "_" "") name)))

(defprotocol To
  (reference [this property])
  (body [this])
  (root-arn [this]))

(defrecord Construct [group type fqn body]
  To
  (reference [{:keys [fqn] :as this} property]
    (let [ctx (merge this {:property property
                           :prefix "${"
                           :suffix "}"
                           :name (fqn->name fqn)})]
      (p/render "{{ prefix }}{{ group|name }}.{{ type|name }}.{{ name }}.{{ property|name }}{{ suffix }}" ctx)))
  (body [{:keys [group type fqn body]}]
    {group {type {(fqn->name fqn) body}}})
  (root-arn [{:keys [group type fqn body] :as this}]
    (cond
      (and (= group :data)
           (= type :aws_caller_identity)
           (= fqn :current)
           (= body {}))
      (-> (reference this :account_id)
          (->> (format "arn:aws:iam::%s:root"))))))

(def caller-identity (->Construct :data :aws_caller_identity :current {}))

(defn ^:export add-suffix [fqn suffix]
  (let [un-namespace (ns fqn)
        un-name (name fqn)]
    (keyword un-namespace (str un-name suffix))))

(comment
  (let [c (map->Construct {:group :data
                           :type :aws_iam_policy_document
                           :fqn ::foo
                           :body {}})]
    (reference c :json)
    (body c))
  (-> caller-identity
      root-arn))
