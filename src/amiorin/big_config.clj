(ns amiorin.big-config
  (:require
   [babashka.process :as p]
   [clojure.string :as str]))

(defn data-fn
  [data]
  (let [big-config-latest-rev (-> (p/shell {:out :string} "git ls-remote https://github.com/amiorin/big-config.git refs/heads/main")
                                  :out
                                  (str/split #"\s+")
                                  first)]
    (assoc data :big-config-latest-rev big-config-latest-rev)))
