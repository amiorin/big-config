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

(defn whitespace-control
  [s delimiters]
  (let [delimiters (merge {:tag-open \{
                           :tag-close \}
                           :filter-open \{
                           :filter-close \}
                           :tag-second \%}
                          delimiters)
        opening-tags (set (for [x [[:tag-open :filter-open] [:tag-open :tag-second]]]
                            (-> (str/join (map delimiters x))
                                (str "-"))))
        closing-tags (set (for [x [[:tag-close :filter-close] [:tag-second :tag-close]]]
                            (->> (str/join (map delimiters x))
                                 (str "-"))))]
    (loop [output ""
           input s
           tag ""]
      (let [[x xs] (if (= (count input) 0)
                     [:done nil]
                     [(subs input 0 1) (subs input 1)])
            tag (if (= x :done)
                  tag
                  (str tag x))
            tag (if (= (count tag) 4)
                  (subs tag 1)
                  tag)]
        (cond
          (= x :done) output
          (opening-tags tag) (recur (str (str/trimr (subs output 0 (dec (dec (count output))))) (subs tag 0 2))
                                    xs
                                    tag)
          (closing-tags tag) (recur (str (subs output 0 (dec (dec (count output)))) (subs tag 1 3))
                                    (str/triml xs)
                                    tag)
          :else (recur (str output x)
                       xs
                       tag))))))
