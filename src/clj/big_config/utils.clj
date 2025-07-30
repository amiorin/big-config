(ns big-config.utils
  (:require
   [babashka.fs :as fs]
   [cheshire.core :as json]
   [com.grzm.awyeah.client.api :as aws]
   [com.grzm.awyeah.credentials :refer [profile-credentials-provider]]))

(defn deep-merge
  "Recursively merges maps."
  [& maps]
  (letfn [(m [& xs]
            (if (some #(and (map? %) (not (record? %))) xs)
              (apply merge-with m xs)
              (last xs)))]
    (reduce m maps)))

(defn sort-nested-map [m]
  (cond
    (map? m) (into (sorted-map)
                   (for [[k v] m]
                     [k (cond
                          (map? v) (sort-nested-map v)
                          (or (vector? v)
                              (seq? v)) (mapv sort-nested-map v)
                          :else v)]))
    (or (vector? m)
        (seq? m)) (mapv sort-nested-map m)
    :else m))

(defn invoke [client operation request]
  (let [response (aws/invoke client {:op operation :request request})]
    (if (contains? response :cognitect.anomalies/category)
      (throw (ex-info "AWS operation failed" {:operation operation :request request :response response}))
      response)))

(defn secrets->map
  [& {:keys [credentials-provider secret-id]}]
  (let [client (aws/client {:api :secretsmanager
                            :region "eu-west-1"
                            :credentials-provider credentials-provider})]
    (-> (invoke client :GetSecretValue {:SecretId secret-id
                                        :Query :SecretString})
        :SecretString
        (json/decode true))))

(defn port-assigner [service]
  (-> (fs/cwd)
      (str service)
      hash
      abs
      (mod 64000)
      (+ 1024)))

(comment
  (secrets->map :credentials-provider (profile-credentials-provider "data_lake_dacore")
                :secret-id "arn:aws:secretsmanager:region:111111111111:secret:prod/squad/system-suffix")
  (port-assigner ["postgres"]))
