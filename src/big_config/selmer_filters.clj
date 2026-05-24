(ns big-config.selmer-filters
  (:require [clojure.string :as str]
            [selmer.parser :as selmer]))

(defn normalize-delimiters
  ([] (normalize-delimiters {}))
  ([delimiters]
   {:tag-open (or (:tag-open delimiters) (:tagOpen delimiters) "{")
    :tag-close (or (:tag-close delimiters) (:tagClose delimiters) "}")
    :filter-open (or (:filter-open delimiters) (:filterOpen delimiters) "{")
    :filter-close (or (:filter-close delimiters) (:filterClose delimiters) "}")
    :tag-second (or (:tag-second delimiters) (:tagSecond delimiters) "%")
    :short-comment-second (or (:short-comment-second delimiters) (:shortCommentSecond delimiters) "#")}))

(defn whitespace-control
  ([input] (whitespace-control input {}))
  ([input delimiters]
   (let [d (normalize-delimiters delimiters)
         opening-tags #{(str (:tag-open d) (:filter-open d) "-")
                        (str (:tag-open d) (:tag-second d) "-")}
         closing-tags #{(str "-" (:tag-close d) (:filter-close d))
                        (str "-" (:tag-second d) (:tag-close d))}]
     (loop [output ""
            rest (seq (str input))
            tag ""]
       (if-not rest
         output
         (let [x (str (first rest))
               tag' (str tag x)
               tag' (if (= 4 (count tag')) (subs tag' 1) tag')]
           (cond
             (contains? opening-tags tag')
             (recur (str (str/trimr (subs output 0 (max 0 (- (count output) 2))))
                         (subs tag' 0 2))
                    (next rest)
                    tag')

             (contains? closing-tags tag')
             (recur (str (subs output 0 (max 0 (- (count output) 2)))
                         (subs tag' 1 3))
                    (seq (str/triml (apply str (next rest))))
                    tag')

             :else
             (recur (str output x) (next rest) tag'))))))))

(selmer/add-filter! "lookup-env" (fn [x] (System/getenv (str x))))
(selmer/add-filter! "->file" (fn [n] (-> (str n) (str/replace "." "/") (str/replace "-" "_"))))
(selmer/add-filter! "remove-https" (fn [url] (str/replace (str url) #"^https://" "")))
