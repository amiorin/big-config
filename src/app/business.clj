(ns app.business
  (:require
   [big-config.store :refer [get-offset handle! store!]]
   [big-config.utils :refer [deep-merge]])
  (:import
   [java.util.concurrent ThreadLocalRandom]))

(def initial-state
  {:theme "light"
   :debug false})

(defn ->nonce []
  (.nextLong (ThreadLocalRandom/current)))

(defn my-business [state [op op-val] timestamp]
  (case op
    :accept-job (let [{:keys [job-name nonce]} op-val
                      job (get-in state [:jobs job-name] {})]
                  (if (and (= (:nonce job) :none)
                           (= (:state job) :running))
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
    :reset-job (let [{:keys [job-name delta]} op-val
                     job (get-in state [:jobs job-name] {})]
                 (if (and (= (:state job) :running)
                          (> (- timestamp (:timestamp job)) delta))
                   (-> state
                       (assoc-in [:jobs job-name :timestamp] timestamp)
                       (assoc-in [:jobs job-name :nonce] :none))
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

(defn accept? [& {:keys [state nonce job-name]}]
  (let [new-once (get-in (handle! state [:accept-job {:job-name job-name :nonce @nonce}])
                         [:jobs job-name :nonce])]
    (= new-once @nonce)))

(defn refresh? [& {:keys [state nonce job-name]}]
  (let [written-once (get-in (handle! state [:refresh-job {:job-name job-name :nonce @nonce :new-nonce (reset! nonce (->nonce))}])
                             [:jobs job-name :nonce])]
    (= written-once @nonce)))

(comment
  (def opts {:business-fn my-business
             :store-key (str "test-" (abs (->nonce)))
             :wcar-opts {:pool :none}})
  (def job-name "tofu")
  (def p (store! opts))
  (def nonce (atom (->nonce)))
  (-> @p)
  (-> @nonce)
  (handle! p [:run-job {:job-name job-name}])
  (refresh? :state p :nonce nonce :job-name job-name)
  (accept? :state p :nonce nonce :job-name job-name)
  (handle! p [:stop-job {:job-name job-name}]))

(comment
  (def opts {:business-fn my-business
             :store-key "test13"
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
  (handle! p1 [:refresh-job {:job-name job-name :nonce @nonce1 :new-nonce (reset! nonce1 (->nonce))}])
  (handle! p2 [:run-job {:job-name job-name}])
  (handle! p2 [:stop-job {:job-name job-name}]))
