(ns big-config.selmer-filters
  (:require
   [selmer.filters :refer [add-filter!]]))

(add-filter! :lookup-env
             (fn [x]
               (System/getenv x)))
