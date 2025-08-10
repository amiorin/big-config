(ns amiorin.big-config
  (:require
   [clojure.string :as str]
   [clojure.tools.deps]
   [clojure.tools.deps.extensions :as extensions]))

(defn do-find-latest-version
  [lib-sym]
  (let [procurer nil
        types (distinct (into [:mvn :git] (extensions/procurer-types)))]
    (->> (some #(extensions/find-versions lib-sym nil % procurer) types)
         (remove #(str/ends-with? (:git/tag %) "-rc"))
         last
         (reduce-kv #(format "%s %s \"%s\"" %1 %2 %3) "")
         str/trim
         (format "{%s}"))))

(defn data-fn
  [data]
  (->> (for [lib-sym ['io.github.amiorin/big-config
                      'io.github.seancorfield/deps-new]]
         {(keyword (str (name lib-sym) "-latest-version")) (do-find-latest-version lib-sym)})
       (reduce #(merge %1 %2) data)))

(comment
  (data-fn {})
  (do-find-latest-version 'io.github.seancorfield/deps-new)
  (do-find-latest-version 'io.github.amiorin/big-config))
