(ns control-plane
  (:require
   [babashka.fs :as fs]
   [babashka.process :refer [shell]]
   [big-config :as bc]
   [big-config.render :as render]
   [big-config.run :as run]
   [big-config.step :as step]
   [big-config.utils :refer [deep-merge sort-nested-map]]
   [big-tofu.core :refer [->Construct construct]]
   [big-tofu.create :as create]
   [cheshire.core :as json]
   [clojure.pprint :as pp]
   [prevayler :refer [handle! prevayler!]])
  (:import
   [java.io File]))

(fs/create-dirs "state")

(def initial-state {:region "eu-west-1"
                    :aws-account-id "251213589273"
                    :module "users"
                    :users {}
                    :target-dir "dist"})

(defn business-fn [state event _timestamp]
  (reduce-kv (fn [new-state op op-val]
               (case op
                 :rename-user (let [old-name (:name op-val)
                                    new-name (:new-name op-val)
                                    users (:users new-state)]
                                (->> (reduce-kv (fn [new-users id name]
                                                  (assoc new-users id (if (= old-name name)
                                                                        new-name
                                                                        name))) {} users)
                                     (assoc new-state :users)))
                 :delete-user (let [del-name (:name op-val)
                                    users (:users new-state)]
                                (->> (reduce-kv (fn [new-users id name]
                                                  (if (= del-name name)
                                                    new-users
                                                    (assoc new-users id name))) {} users)
                                     (assoc new-state :users)))
                 :delete-all-users (assoc new-state :users {})
                 :merge (deep-merge new-state op-val)
                 :reset initial-state)) state event))

(def p-args {:initial-state initial-state
             :business-fn business-fn
             :journal-file (File. "state/journal4")})

(defn run-template
  [& {:keys [dsl target-dir data]}]
  (step/run-steps dsl
                  {::bc/env :shell
                   ::run/shell-opts {:dir target-dir}
                   ::render/templates [(merge {:template "control-plane"
                                               :target-dir target-dir
                                               :overwrite true
                                               :data-fn (constantly data)
                                               :transform [['control-plane/content-fn
                                                            {:users "main.tf.json"}
                                                            :raw]]})]}))

(defn dispatch
  [op opts]
  (with-open [p (prevayler! p-args)]
    (let [{:keys [target-dir aws-account-id region module]} @p
          dsl "render %s %s -- module profile"
          tofu-init (if (fs/exists? (str target-dir "/.terraform")) "" "tofu:init")]
      (case op
        :tfstate-path (println (format "s3://tf-state-%s-%s/%s.tfstate" aws-account-id region module))
        :print-state (pp/pprint @p)
        :merge-state (handle! p {:merge opts})
        :reset-state (handle! p {:reset opts})
        :create-user (let [name (:name opts)]
                       (handle! p {:merge {:users {(random-uuid) name}}}))
        :delete-user (let [name (:name opts)]
                       (handle! p {:delete-user {:name name}}))
        :rename-user (let [name (:name opts)
                           new-name (:new-name opts)]
                       (handle! p {:rename-user {:name name
                                                 :new-name new-name}}))
        :delete-all-users (handle! p {:delete-all-users nil})
        :create-bucket (shell {:continue true} (format "aws s3 mb s3://tf-state-%s-%s" aws-account-id region))
        :apply-state (run-template :target-dir target-dir
                                   :dsl (format dsl tofu-init "tofu:apply:-auto-approve")
                                   :data @p)
        :diff-state (run-template :target-dir target-dir
                                  :dsl (format dsl tofu-init "tofu:plan")
                                  :data @p)))))

(defn help
  [& _]
  (println "Usage: clojure -Tctlp <subcommand> [args]

ctrlp is a tech demo of a control plane based on BigConfig

Useful alias:
  alias p=\"clojure -Tcltp\"

State commands:
  merge-state      Merge a new map into the state
  print-state      Print the state to the stdout
  reset-state      Reset the state to the default one

AWS commands:
  tfstate-path     Print the S3 path of the terraform/tofu state
  create-bucket    Create the bucket for the terraform/tofu state
  apply-state      Run terraform/tofu apply
  diff-state       Run terraform/tofu plan

User commands:
  create-user      Create a new user
  rename-user      Rename a user
  delete-user      Delete a user
  delete-all-users Delete all users

Examples:
  p crate-user :name '\"alice\"'
  p rename-user :name '\"alice\"' :new-name '\"bob\"'
  p merge-state :aws-account-id '\"111111111111\"' :region '\"us-west-1\"'
"))

(defn merge-state
  [& {:as args}]
  (dispatch :merge-state args))

(defn print-state
  [& {:as args}]
  (dispatch :print-state args))

(defn reset-state
  [& {:as args}]
  (dispatch :reset-state args))

(defn create-bucket
  [& {:as args}]
  (dispatch :create-bucket args))

(defn tfstate-path
  [& {:as args}]
  (dispatch :tfstate-path args))

(defn apply-state
  [& {:as args}]
  (dispatch :apply-state args))

(defn diff-state
  [& {:as args}]
  (dispatch :diff-state args))

(defn create-user
  [& {:as args}]
  (dispatch :create-user args))

(defn delete-user
  [& {:as args}]
  (dispatch :delete-user args))

(defn delete-all-users
  [& {:as args}]
  (dispatch :delete-all-users args))

(defn rename-user
  [& {:as args}]
  (dispatch :rename-user args))

(defn list-users
  [& {:as args}]
  (dispatch :list-users args))

(comment
  (help)
  (tfstate-path)
  (merge-state :region "eu-west-1" :aws-account-id "111" :module "users")
  (print-state)
  (reset-state)
  (create-bucket)
  (apply-state)
  (diff-state)
  (create-user :name "alberto")
  (delete-user :name "alberto")
  (delete-all-users)
  (rename-user :name "alberto" :new-name "albi")
  (list-users))

(defn content-fn
  [module {:keys [region aws-account-id users] :as data}]
  (case module
    :users (let [bucket (format "tf-state-%s-%s" aws-account-id region)
                 provider (create/provider (assoc data :bucket bucket))
                 users (for [[id name] users]
                         (construct (->Construct :resource :aws_iam_user (keyword (str "user-" id)) {:name name})))
                 m (->> [provider]
                        (into users)
                        (apply deep-merge)
                        sort-nested-map)]
             (json/generate-string m {:pretty true}))))

(comment
  (content-fn :users @(prevayler! p-args)))
