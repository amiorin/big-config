(ns amiorin.big-config
  (:require
   [clojure.pprint :as pp]
   [clojure.string :as str]))

(defn data-fn
  [{:keys [aws-account-id aws-assume-role region bucket] :as data}]
  (let [aws-account-id (str (or aws-account-id "111111111111"))
        region (str (or region "eu-west-1"))
        bucket (or bucket (str/join "-" ["tf-state" aws-account-id region]))]
    (merge data {:aws-account-id aws-account-id
                 :region region
                 :bucket bucket
                 :aws-assume-role aws-assume-role})))

(defn template-fn
  "Example template-fn handler.

  Result is used as the EDN for the template."
  [edn data]
  ;; must return the whole EDN hash map
  edn)

(defn post-process-fn
  "Example post-process-fn handler.

  Can programmatically modify files in the generated project."
  [edn data])
