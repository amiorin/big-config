(ns big-config.selmer-filters
  (:require
   [clojure.string :as str]
   [selmer.filters :refer [add-filter!]]))

(add-filter! :lookup-env
             (fn [x]
               (System/getenv x)))

(add-filter! :lookup-env
             (fn [x]
               (System/getenv x)))

(add-filter! :->file
             (fn [n]
               (-> n (str) (str/replace "." "/") (str/replace "-" "_"))))
