(ns {{top/ns}}.user-data
  (:require
   [clojure.java.io :as io]
   [selmer.parser :as p]))

(def text "Hello world!")

(defn render [s]
  (-> s
      io/resource
      slurp
      (p/render {:text text})))
