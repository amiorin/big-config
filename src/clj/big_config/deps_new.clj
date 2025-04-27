(ns big-config.deps-new
  (:require
   [org.corfield.new :as new]))

(defn data-fn
  [data]
  data)

(defn template-fn
  [edn data]
  edn)

(defn post-process-fn
  [edn data])

(comment
  (new/create {:template "big-config/action"
               :name "big-config/action"
               :target-dir ".github/workflows"
               :overwrite true}))
