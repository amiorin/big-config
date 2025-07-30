(ns big-config.call
  (:require
   [babashka.fs :as fs]
   [big-config :as bc]
   [big-config.aero :as aero]
   [big-config.core :refer [->workflow]]
   [cheshire.core :as json]
   [clojure.walk :as walk]))

(defn call-fn [{:keys [::fns] :as opts}]
  (let [{:keys [f args]} (first fns)]
    (-> (symbol f)
        requiring-resolve
        (apply args))
    (merge opts {::bc/exit 0
                 ::bc/err nil})))

(defn push-nil [{:keys [::fns] :as opts}]
  (let [fns (if (seq fns)
              (conj (seq fns) nil)
              [nil])]
    (assoc opts ::fns fns)))

(def call-fns
  (->workflow {:first-step ::start
               :wire-fn (fn [step _]
                          (case step
                            ::start [push-nil ::call-fn]
                            ::call-fn [call-fn ::call-fn]
                            ::end [identity]))
               :next-fn (fn [step _ {:keys [::bc/exit ::fns] :as opts}]
                          (cond
                            (and (seq (rest fns))
                                 (or (= exit 0)
                                     (nil? exit))) [::call-fn (merge opts {::fns (rest fns)})]
                            (= step ::end) [nil opts]
                            :else [::end opts]))}))

(defn mkdir-and-spit [{:keys [out type f args]}]
  (-> (fs/parent out)
      (fs/create-dirs))
  (let [res (-> (symbol f)
                requiring-resolve
                (apply args))
        res (case type
              :text res
              :json (json/generate-string res {:pretty true}))]
    (spit out res)))

(defn stability
  "Use this function in your tests to make sure that your code is always
  producing the same configuration files. The configurations files must be
  committed."
  [opts module]
  (let [{:keys [::bc/exit] :as opts} (aero/read-module opts)
        _ (when (> exit 0)  (throw (ex-info "Failed to read the edn file" opts)))
        files (-> opts
                  ::fns
                  (->> (filter #(= (:f %) "big-config.call/mkdir-and-spit"))
                       (map #(-> % :args first :out))))
        files-v1 (mapv #(slurp %) files)
        {:keys [::bc/exit]} (call-fns opts)
        _ (when (> exit 0)  (throw (ex-info "Failed to call-fns" opts)))
        files-v2 (mapv #(slurp %) files)
        _ (when-not (= files-v1 files-v2) (throw (ex-info (format "Module %s has changed" module) opts)))]))

(defn catch-nils
  "Use this function in your tests to make sure that your code is not generating
  nils. The configurations files must be committed."
  [opts module]
  (let [{:keys [::bc/exit] :as opts} (aero/read-module opts)
        _ (when (> exit 0)  (throw (ex-info "Failed to read the edn file" opts)))
        xs (-> opts
               ::fns
               (->> (filter #(= (:f %) "big-config.call/mkdir-and-spit"))
                    (filter #(-> % :args first :type (= :json)))
                    (map #(-> % :args first))))]
    (doall
     (for [x xs]
       (let [{:keys [f args]} x
             f (-> f symbol requiring-resolve)]
         (->> (apply f args)
              (walk/prewalk
               #(if (nil? %)
                  (throw (ex-info (format "nil value found in module %s" module) opts))
                  %))))))))

(comment
  (mkdir-and-spit nil)
  (stability nil nil)
  (catch-nils nil nil)
  (call-fns [(fn [f step opts]
               (println step)
               (f step opts))]
            {::fns [{:f "big-config.call/mkdir-and-spit"
                     :desc "spit main.tf.json"
                     :args [{:out "big-infra/tofu/251213589273/alpha/main.tf.json"
                             :type :json
                             :f "tofu.alpha.main/invoke"
                             :args [{:aws-account-id "251213589273"
                                     :region "eu-west-1"
                                     :module :alpha}]}]}
                    {:f "big-config.call/mkdir-and-spit"
                     :desc "spit user_data.sh"
                     :args [{:out "big-infra/tofu/251213589273/alpha/files/user_data.sh"
                             :type :text
                             :f "tofu.alpha.user-data/invoke"
                             :args []}]}]}))
