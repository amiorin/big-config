(ns big-config.aero
  (:require
   [aero.core :as aero]
   [big-config :as bc]
   [big-config.utils :refer [deep-merge]]
   [clojure.java.io :as io]
   [clojure.string :as str]
   [clojure.walk :as walk]
   [selmer.parser :as p]))

(defn ready?
  "All elements resolves to a string"
  [config ready x]
  (if (or (string? x)
          (and (keyword? x) (or (string? (x config))
                                (keyword? (x config)))))
    ready
    false))

(defn seq->str
  "Convert the seq to a str"
  [config xs]
  (->> xs
       (map (fn [e] (if (keyword? e)
                      (name (e config))
                      e)))
       (str/join "")))

(defn aero-join
  "Template fn to join an array of string and variables to a string"
  [config xs done]
  (let [ready (reduce (partial ready? config) true xs)
        xs (if ready
             (seq->str config xs)
             (conj xs ::join))]
    (reset! done (and @done ready))
    xs))

(defn read-module
  "Step to read the opts from file or resource"
  [{:keys [::config ::module ::profile] :as opts}]
  (when (some nil? [config module profile])
    (throw (ex-info "Either config, module, or profile are nil" opts)))
  (let [msg (p/render "Module {{ big-config..aero/module }} does not exist in config {{ big-config..aero/config | str }}" opts)
        config (-> (aero/read-config (io/resource config) {:profile (or profile :default)})
                   module)]
    (when (nil? config)
      (throw (ex-info msg {})))
    (loop [config (deep-merge config opts)
           done (atom true)
           iteration 0]
      (let [config (walk/prewalk #(if (and (sequential? %)
                                           (= (first %) ::join))
                                    (aero-join config (rest %) done)
                                    %) config)]
        (if (> iteration 100)
          (merge config
                 {::bc/exit 1
                  ::bc/err "Too many iteration in `big-config.aero/read-module`"})
          (if @done
            (merge config
                   {::bc/exit 0
                    ::bc/err nil})
            (recur config (atom true) (inc iteration))))))))
