(ns big-config.store
  (:require
   [taoensso.carmine :as car :refer [wcar]])
  (:import
   [clojure.lang IDeref]
   [java.io
    Closeable]))

(defn ->handler
  [f]
  (fn [[offset user-state] event timestamp next-offset]
    (assert (= (inc offset) next-offset) "Offsets should be a continuos sequence of natural number starting from 0")
    [next-offset (f user-state event timestamp)]))

; Success
;  0. "OK"
;  1. "OK"
;  2. "QUEUED"
;  3. [1]
; watch fails
;  0. "OK"
;  1. "OK"
;  2. "QUEUED"
;  3. nil
; no-concurrent-write finds a new event with the same offset
;  0. "OK"
;  1. "OK"
;  2. []
(defn- write! [offset timestamp event state-hash store-key wcar-opts]
  (-> (wcar wcar-opts
            (car/watch store-key)
            (let [no-concurrent-write (not (seq (car/with-replies (car/zrange store-key offset offset "BYSCORE"))))]
              (car/multi)
              (when no-concurrent-write
                (car/zadd store-key offset [offset timestamp state-hash event]))
              (car/exec)))
      (nth 3 nil)
      (nth 0 false)))

(comment
  (for [reply [["OK" "OK" "QUEUED" [1]]
               ["OK" "OK" "QUEUED" nil]
               ["OK" "OK" []]]]
    (-> reply
        (nth  3 nil)
        (nth 0 false)))

  (let [offset 1
        timestamp 1
        event {:op :inc}
        state-hash (hash [1 {:cnt 1}])
        wcar-opts {:pool (car/connection-pool {})
                   :spec {:uri "redis://localhost:6379/"}}
        store-key "store-state"]
    (wcar wcar-opts (car/flushall))
    (write! offset timestamp event state-hash store-key wcar-opts)))

(defn- restore! [handler state-atom store-key wcar-opts]
  (let [[offset _] @state-atom
        neg-offste-str (str (- offset))
        states (wcar wcar-opts (car/zrange store-key "-inf" neg-offste-str "BYSCORE" "LIMIT" "0" "1"))]
    (when (seq states)
      (let [[[neg-offset previous-state]] states]
        (reset! state-atom [(abs neg-offset) previous-state])))
    (let [start-index (str "(" (-> state-atom deref first))
          new-events (wcar wcar-opts (car/zrange store-key start-index "+inf" "BYSCORE"))]
      (doseq [[offset timestamp expected-state-hash event] new-events]
        (let [state (swap! state-atom handler event timestamp offset)]
          (when (and expected-state-hash
                     (not= (hash state) expected-state-hash))
            (throw (ex-info "Inconsistent state detected during event journal replay" {:hash (hash state)
                                                                                       :expected-state-hash expected-state-hash}))))))))

(comment
  (let [handler (->handler (fn [state {:keys [op]} _timestamp]
                             (case op
                               :inc (update state :cnt inc))))
        state-atom (atom [0 {:cnt 0}])
        store-key "store-state"
        wcar-opts {:pool (car/connection-pool {})
                   :spec {:uri "redis://localhost:6379/"}}]

    (restore! handler state-atom store-key wcar-opts)
    @state-atom))

(defprotocol Store
  (handle! [this event] "Journals the event, applies the business function to the state and the event; and returns the new state.")
  (snapshot! [this] "Creates a snapshot of the current state.")
  (timestamp [this] "Calls the timestamp-fn")
  (get-offset [this] "Get the current offset"))

(defn store! [{:keys [initial-state business-fn timestamp-fn store-key snapshot-every wcar-opts close-fn]
               :or {initial-state {}
                    timestamp-fn #(System/currentTimeMillis)
                    store-key "store-state"
                    snapshot-every 10
                    wcar-opts {}
                    close-fn (constantly nil)}}]
  (let [state-atom (atom [0 initial-state])
        handler (->handler business-fn)]
    (restore! handler state-atom store-key wcar-opts)

    (reify
      Store
      (handle! [this event]
        (locking this  ; (I)solation: strict serializability.
          (loop []
            (let [[offset current-user-state] @state-atom
                  timestamp (timestamp-fn)
                  new-state (handler @state-atom event timestamp (inc offset)) ; (C)onsistency: must be guaranteed by the handler. The event won't be journalled when the handler throws an exception.
                  [next-offset new-user-state] new-state]
              (when-not (= new-user-state current-user-state)
                (if (write! next-offset timestamp event (hash new-state) store-key wcar-opts) ; (D)urability
                  (do (reset! state-atom new-state) ; (A)tomicity
                      (when (= 0 (mod next-offset snapshot-every))
                        (snapshot! this))
                      new-user-state)
                  (do (restore! handler state-atom store-key wcar-opts) ; optimistic lock failed
                      (recur))))))))

      (snapshot! [_this]
        (let [[offset current-user-state] @state-atom
              neg-offset (- offset)]
          (wcar wcar-opts
                (car/zadd store-key neg-offset [neg-offset current-user-state])
                (car/zremrangebyscore store-key (str "(" neg-offset) "0"))))

      (timestamp [_] (timestamp-fn))

      (get-offset [_] (first @state-atom))

      IDeref (deref [_] (second @state-atom))

      Closeable (close [_] (close-fn wcar-opts)))))
