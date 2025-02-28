(ns big-config)

(defn deep-merge
  "Recursively merges maps."
  [& maps]
  (letfn [(m [& xs]
            (if (some #(and (map? %) (not (record? %))) xs)
              (apply merge-with m xs)
              (last xs)))]
    (reduce m maps)))

(defn nested-sort-map [m]
  (into (sorted-map)
        (for [[k v] m]
          [k (if (map? v)
               (nested-sort-map v)
               v)])))
