(ns control-plane
  (:require
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [->Construct construct]]
   [big-tofu.create :as create]
   [cheshire.core :as json]
   [clojure.pprint :as pp]
   [prevayler :refer [handle! prevayler!]])
  (:import
   [java.io File]))

(defn business-fn [state {:keys [cmd value]} _timestamp]
  (case cmd
    :add state))

(def args {:business-fn business-fn
           :journal-file (File. "state/journal4")})

(defn add
  [n]
  (with-open [p1 (prevayler! args)]
    (handle! p1 {:cmd :add
                 :value n})))

(defn dispatch
  [op opts]
  (pp/pprint opts))

(defn init
  [& {:as args}]
  (dispatch :init args))

(defn create-user
  [& {:as args}]
  (dispatch :create-user args))

(defn delete-user
  [& {:as args}]
  (dispatch :delete-user args))

(defn rename-user
  [& {:as args}]
  (dispatch :rename-user args))

(defn list-users
  [& {:as args}]
  (dispatch :list-users args))

(comment
  (init :region "eu-west-1" :aws-account-id "111")
  (create-user :name "alberto")
  (rename-user :name "alberto" :new-name "albi")
  (delete-user :name "alberto")
  (list-users))

(do
  (defn kw->content
    [kw {:keys [region aws-account-id] :as data}]
    (case kw
      :alpha (let [bucket (format "tf-state-%s-%s" aws-account-id region)
                   provider (create/provider (assoc data :bucket bucket))
                   user (construct (->Construct :resource :aws_iam_user ::alberto {:name "alberto"}))
                   m (->> [provider user]
                          (apply deep-merge)
                          sort-nested-map)]
               (json/generate-string m {:pretty true}))))
  (kw->content :alpha {:region "eu-west-1"
                       :aws-account-id "111"
                       :module :alpha}))
