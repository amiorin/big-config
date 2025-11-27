(ns app.utils
  (:require
   [clojure.string :as str]))

(defn encode [s]
  (-> s
      (str/replace "%" "%25")
      (str/replace "'" "%27")
      (str/replace "\"" "%22")))

(defn decode [s]
  (-> s
      (str/replace "%25" "%")
      (str/replace "%27" "'")
      (str/replace "%22" "\"")))

(comment
  (-> "'%\"" encode decode))
