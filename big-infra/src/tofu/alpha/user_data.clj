(ns tofu.alpha.user-data
  (:require
   [clojure.java.io :as io]
   [selmer.parser :as p]))

(def text "Hello world!")

(defn ^:export invoke []
  (-> "user_data.sh"
      io/resource
      slurp
      (p/render {:text text})))
