(ns big-config.utils)

(defn deep-merge
  "Recursively merges maps."
  [& maps]
  (letfn [(m [& xs]
            (if (some #(and (map? %) (not (record? %))) xs)
              (apply merge-with m xs)
              (last xs)))]
    (reduce m maps)))

(defn nested-sort-map [m]
  (cond
    (map? m) (into (sorted-map)
                   (for [[k v] m]
                     [k (cond
                          (map? v) (nested-sort-map v)
                          (or (vector? v) (seq? v)) (mapv nested-sort-map v)
                          :else v)]))
    (or (vector? m) (seq? m)) (mapv nested-sort-map m)
    :else m))
