(ns big-config.utils
  (:refer-clojure :exclude [clone])
  (:require [big-config.keys :as k]
            [clojure.string :as str])
  (:import [java.security MessageDigest]))

(defonce function-registry (atom {}))

(defn register-function [name f]
  (let [name' (k/key-string name)]
    (swap! function-registry assoc name' f)
    f))

(defn unregister-function [name]
  (swap! function-registry dissoc (k/key-string name)))

(defn resolve-registered-function [name]
  (get @function-registry (k/key-string name)))

(defn resolve-symbol-var [s]
  (when-let [sym (cond
                   (symbol? s) s
                   (string? s) (symbol s)
                   :else nil)]
    (or (resolve sym)
        (when-let [ns-name (some-> sym namespace symbol)]
          (try
            (require ns-name)
            (ns-resolve ns-name (symbol (name sym)))
            (catch Throwable _ nil))))))

(defn ->fn
  ([value] (->fn value ::none))
  ([value default-value]
   (cond
     (fn? value) value
     (var? value) @value

     (or (string? value) (symbol? value) (keyword? value))
     (or (resolve-registered-function value)
         (when-let [v (resolve-symbol-var value)]
           (when (and (var? v) (ifn? @v)) @v))
         (when (keyword? value)
           (fn [m] (get m value)))
         (when (and (string? value) (.startsWith ^String value ":"))
           (let [kw (k/normalize-keyword value)]
             (fn [m] (get m kw))))
         (throw (ex-info (str "Cannot resolve function '" value "'")
                         {:big-config/err-kind :big-config.utils/not-a-fn
                          :value value})))

     (nil? value)
     (if (= default-value ::none)
       (throw (ex-info "Required value is nil; expected a function, symbol or string"
                       {:big-config/err-kind :big-config.utils/not-a-fn
                        :value value}))
       default-value)

     :else
     (throw (ex-info "Cannot coerce value to a function"
                     {:big-config/err-kind :big-config.utils/not-a-fn
                      :value value
                      :type (type value)})))))

(defn deep-merge
  [& maps]
  (letfn [(merge* [a b]
            (merge-with (fn [x y]
                          (if (and (k/plain-map? x) (k/plain-map? y))
                            (merge* x y)
                            y))
                        (or a {})
                        (or b {})))]
    (reduce merge* {} maps)))

(defn sort-nested-map [value]
  (cond
    (map? value) (into (sorted-map-by (fn [a b] (compare (pr-str a) (pr-str b))))
                       (map (fn [[k v]] [k (sort-nested-map v)]) value))
    (vector? value) (mapv sort-nested-map value)
    (seq? value) (doall (map sort-nested-map value))
    :else value))

(def deep-sort-maps sort-nested-map)

(defn stable-stringify [value]
  (pr-str (sort-nested-map value)))

(defn bytes->hex [bytes]
  (apply str (map #(format "%02x" (bit-and 0xff %)) bytes)))

(defn hash-string
  ([value] (hash-string value 8))
  ([value length]
   (let [digest (.digest (MessageDigest/getInstance "SHA-256") (.getBytes (str value) "UTF-8"))]
     (subs (bytes->hex digest) 0 length))))

(defn port-assigner [service]
  (let [hash (Long/parseUnsignedLong (hash-string (str (System/getProperty "user.dir")
                                                       (stable-stringify service)) 8)
                                     16)]
    (+ 1024 (mod (Math/abs hash) 64000))))

(defn assert-args-present [args]
  (doseq [[n value] args]
    (when (nil? value)
      (throw (IllegalArgumentException. (str "Argument " n " is nil"))))))

(defn keyword->path [kw]
  (let [s (k/key-string kw)]
    (str/replace s #"\." "/")))

(defn keyword->name [kw]
  (let [k (k/normalize-keyword kw)
        full (if-let [ns (namespace k)]
               (str ns "-" (name k))
               (name k))]
    (-> full
        (str/replace "/" "-")
        (str/replace "." "-"))))

(defn clone [value] value)

(defn get-in* [obj path]
  (get-in obj path))

(defn assoc-in* [obj path value]
  (assoc-in (or obj {}) path value))

(defn update-in* [obj path f]
  (assoc-in* obj path (f (get-in obj path))))

(defn debug [body]
  (let [taps (atom [])
        result (body #(swap! taps conj %))]
    {:result result
     :taps (deep-sort-maps @taps)}))
