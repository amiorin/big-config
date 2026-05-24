(ns big-config.big-tofu.core
  (:require [big-config.keys :as k]
            [clojure.string :as str]))

(defn add-suffix [fqn suffix]
  (k/add-suffix fqn suffix))

(defn fqn->name
  ([fqn] (fqn->name fqn "_"))
  ([fqn c]
   (let [sanitize #(str/replace % #"[-\.]" c)
         fqn (k/normalize-keyword fqn)
         ns (k/namespace-of fqn)
         n (sanitize (k/name-of fqn))]
     (if ns
       (str (sanitize ns) c n)
       n))))

(defrecord Construct [group type fqn block])

(defn reference [this property]
  (str "${" (k/name-of (:group this)) "." (k/name-of (:type this)) "." (fqn->name (:fqn this)) "." (k/name-of property) "}"))

(defn construct [this]
  {(keyword (k/name-of (:group this)))
   {(keyword (k/name-of (:type this)))
    {(keyword (fqn->name (:fqn this))) (:block this)}}})

(defn- remove-https [url]
  (str/replace (str url) #"^https://" ""))

(defn arn
  ([this aws-account-id] (arn this aws-account-id nil))
  ([this aws-account-id region]
   (let [group (k/name-of (:group this))
         type (k/name-of (:type this))
         block (:block this)]
     (cond
       (and (= group "resource") (= type "aws_iam_role"))
       (str "arn:aws:iam::" aws-account-id ":role/" (:name block))

       (and (= group "resource") (= type "aws_iam_openid_connect_provider"))
       (str "arn:aws:iam::" aws-account-id ":oidc-provider/" (remove-https (:url block)))

       (and (= group "resource") (= type "aws_secretsmanager_secret") region)
       (str "arn:aws:secretsmanager:" region ":" aws-account-id ":secret/" (:name block))

       :else nil))))

(defn root-arn [this]
  (when (and (= "data" (k/name-of (:group this)))
             (= "aws_caller_identity" (k/name-of (:type this)))
             (= "current" (k/name-of (:fqn this)))
             (= {} (:block this)))
    (str "arn:aws:iam::" (reference this :account_id) ":root")))

(def caller-identity (->Construct :data :aws_caller_identity :current {}))
