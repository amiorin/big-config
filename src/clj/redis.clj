(ns redis
  (:require
   [taoensso.carmine :as car :refer [wcar]]
   [taoensso.nippy :as nippy])
  (:import
   [clojure.lang IDeref]
   [java.io
    BufferedInputStream
    BufferedOutputStream
    Closeable
    DataInputStream
    DataOutputStream
    EOFException
    File
    FileInputStream
    FileOutputStream]))

(defn- rename! [file new-file]
  (when-not (.renameTo file new-file)
    (throw (RuntimeException. (str "Unable to rename " file " to " new-file)))))

(defn- produce-backup-file! [file]
  (let [backup (File. (str file ".backup"))]
    (if (.exists backup)
      backup
      (when (.exists file)
        (rename! file backup)
        backup))))

(defn- read-value! [data-in]
  (try
    (nippy/thaw-from-in! data-in)
    (catch EOFException eof
      (throw eof))
    (catch Exception corruption
      (println "Warning - Exception thrown while reading journal (this is normally OK and can happen when the process is killed during write):" corruption)
      (throw (EOFException.)))))

(defonce conn-pool (car/connection-pool {})) ; Create a new stateful pool
(def     conn-spec {:uri "redis://localhost:6379/"})
(def     wcar-opts {:pool conn-pool, :spec conn-spec})

(defmacro wcar* [& body] `(car/wcar wcar-opts ~@body))

(do
  (wcar* (car/flushall))
  ;; -offset [-offset state]
  (wcar* (car/zadd "prevayler-state" -1 [-1 {:cnt 1}]))
  (wcar* (car/zadd "prevayler-state" -2 [-2 {:cnt 2}]))
  ;; offset [offset timestamp sha event]
  (wcar* (car/zadd "prevayler-state" 1 [1 1 681490635 {:op :inc}]))
  (wcar* (car/zadd "prevayler-state" 2 [2 2 973101094 {:op :inc}]))
  (wcar* (car/zadd "prevayler-state" 3 [3 3 -2081955313 {:op :inc}]))
  (wcar* (car/zadd "prevayler-state" 4 [4 4 695947906 {:op :inc}]))
  (wcar* (car/zrange "prevayler-state" "-inf" "0" "BYSCORE" "LIMIT" "0" "1"))
  #_(wcar* (car/zrange "prevayler-state" "(0" "+inf" "BYSCORE")))

(wcar* (car/zscan "foo" 0))

(defn ->handler
  [f]
  (fn [[offset user-state] event timestamp next-offset]
    (assert (= (inc offset) next-offset) "Offsets should be a continuos sequence of natural number starting from 0")
    [next-offset (f user-state event timestamp)]))

(defn- write! [offset timestamp event state-hash store-key wcar-opts]
  (wcar wcar-opts (car/zadd store-key offset [offset timestamp state-hash event])))

(let [offset 1
      timestamp 1
      event {:op :inc}
      state-hash (hash [1 {:cnt 1}])
      wcar-opts {:pool (car/connection-pool {})
                 :spec {:uri "redis://localhost:6379/"}}
      store-key "prevayler-state"]
  (write! offset timestamp event state-hash store-key wcar-opts))

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
          (when (and expected-state-hash ; Old prevayler4 journals don't have this state hash saved (2023-11-01)
                     (not= (hash state) expected-state-hash))
            (throw (ex-info "Inconsistent state detected during event journal replay" {:hash (hash state)
                                                                                       :expected-state-hash expected-state-hash}))))))))

(comment
  (let [handler (->handler (fn [state {:keys [op]} _timestamp]
                             (case op
                               :inc (update state :cnt inc))))
        state-atom (atom [0 {:cnt 0}])
        store-key "prevayler-state"
        wcar-opts {:pool (car/connection-pool {})
                   :spec {:uri "redis://localhost:6379/"}}]

    (restore! handler state-atom store-key wcar-opts)
    @state-atom))

(defprotocol Prevayler
  (handle! [this event] "Journals the event, applies the business function to the state and the event; and returns the new state.")
  (snapshot! [this] "Creates a snapshot of the current state.")
  (timestamp [this] "Calls the timestamp-fn"))

(defn prevayler! [{:keys [initial-state business-fn timestamp-fn store-key snapshot-every wcar-opts]
                   :or {initial-state {}
                        timestamp-fn #(System/currentTimeMillis)
                        store-key "prevayler-state"
                        snapshot-every 10
                        wcar-opts {:pool (car/connection-pool {})
                                   :spec {:uri "redis://localhost:6379/"}}}}]
  (let [state-atom (atom [0 initial-state])
        handler (->handler business-fn)]
    (restore! handler state-atom store-key wcar-opts)

    (reify
      Prevayler
      (handle! [this event]
        (locking this  ; (I)solation: strict serializability.
          (let [[offset current-user-state] @state-atom
                timestamp (timestamp-fn)
                new-state (handler @state-atom event timestamp (inc offset)) ; (C)onsistency: must be guaranteed by the handler. The event won't be journalled when the handler throws an exception.
                [next-offset new-user-state] new-state]
            (when-not (identical? new-user-state current-user-state)
              (write! next-offset timestamp event (hash new-state) store-key wcar-opts) ; (D)urability
              (reset! state-atom new-state)) ; (A)tomicity
            new-user-state)))

      (snapshot! [_this])

      (timestamp [_] (timestamp-fn))

      IDeref (deref [_] (second @state-atom))

      Closeable (close [_]))))

(with-open [p (prevayler! {:store-key "foo"
                           :initial-state {:cnt 0}
                           :business-fn (fn [state event _timestamp]
                                          (update state :cnt inc))})]
  @p
  #_(handle! p {:op :inc}))
