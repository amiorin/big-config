(ns big-config.utils
  (:require
   [babashka.fs :as fs]))

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

(defn port-assigner [service]
  (-> (fs/cwd)
      (str service)
      hash
      abs
      (mod 64000)
      (+ 1024)))

(comment
  (port-assigner ["postgres"]))
