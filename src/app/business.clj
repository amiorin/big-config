(ns app.business
  (:require
   [big-config.store :refer [get-offset handle! store!]]
   [big-config.utils :refer [deep-merge]]))

(def initial-state
  {:theme "light"
   :debug false})

(defn ->nonce []
  (let [uuid (clojure.core/random-uuid)]
    (.getLeastSignificantBits uuid)))

(defn my-business [state [op op-val] timestamp]
  (case op
    :accept-job (let [{:keys [job-name nonce]} op-val
                      job (get-in state [:jobs job-name] {})]
                  (if (= (:nonce job) :none)
                    (-> state
                        (assoc-in [:jobs job-name :timestamp] timestamp)
                        (assoc-in [:jobs job-name :nonce] nonce))
                    state))
    :refresh-job (let [{:keys [job-name nonce new-nonce]} op-val
                       job (get-in state [:jobs job-name] {})]
                   (if (and (not= (:nonce job) :none)
                            (= (:nonce job) nonce))
                     (-> state
                         (assoc-in [:jobs job-name :timestamp] timestamp)
                         (assoc-in [:jobs job-name :nonce] new-nonce))
                     state))
    :run-job (let [{:keys [job-name]} op-val
                   job (get-in state [:jobs job-name] {:state :stopped})]
               (if (= (:state job) :stopped)
                 (-> state
                     (assoc-in [:jobs job-name :state] :running)
                     (assoc-in [:jobs job-name :timestamp] timestamp)
                     (assoc-in [:jobs job-name :nonce] :none))
                 state))
    :stop-job (let [{:keys [job-name]} op-val
                    job (get-in state [:jobs job-name] {})]
                (if (= (:state job) :running)
                  (-> state
                      (assoc-in [:jobs job-name :state] :stopped)
                      (assoc-in [:jobs job-name :timestamp] timestamp)
                      (assoc-in [:jobs job-name :nonce] :none))
                  state))
    :merge (deep-merge state op-val)
    :reset initial-state))

(comment
  (def opts {:business-fn my-business
             :store-key "test11"
             :wcar-opts {:pool :none}})
  (def job-name "tofu")
  (def p1 (store! opts))
  (def p2 (store! opts))
  (def nonce1 (atom (->nonce)))
  (def nonce2 (atom (->nonce)))
  (-> @p1)
  (-> @p2)
  (-> @nonce1)
  (-> @nonce2)
  (get-offset p1)
  (get-offset p2)
  (handle! p1 [:run-job {:job-name job-name}])
  (handle! p1 [:accept-job {:job-name job-name :nonce @nonce1}])
  (-> (handle! p2 [:accept-job {:job-name job-name :nonce @nonce2}])
      :jobs
      (get "tofu")
      :nonce
      (= @nonce2))
  (handle! p1 [:refresh-job {:job-name job-name :nonce @nonce1 :new-nonce (swap! nonce1 inc)}])
  (handle! p2 [:run-job {:job-name job-name}])
  (handle! p2 [:stop-job {:job-name job-name}]))
