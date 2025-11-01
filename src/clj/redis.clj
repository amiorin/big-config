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

(defn- try-to-restore! [handler state-atom data-in]
  (let [previous-state (read-value! data-in)] ; Can throw EOFException
    (reset! state-atom previous-state))
  (while true ;Ends with EOFException
    (let [[timestamp event expected-state-hash] (read-value! data-in)
          state (swap! state-atom handler event timestamp)]
      (when (and expected-state-hash ; Old prevayler4 journals don't have this state hash saved (2023-11-01)
                 (not= (hash state) expected-state-hash))
        (println "Inconsistent state detected after restoring event:\n" event)
        (throw (IllegalStateException. "Inconsistent state detected during event journal replay. https://github.com/klauswuestefeld/prevayler-clj/blob/master/reference.md#inconsistent-state-detected"))))))

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
  (wcar* (car/zadd "prevayler-state" 1 [1 1 "sha1" {:op :inc}]))
  (wcar* (car/zadd "prevayler-state" 2 [2 2 "sha2" {:op :inc}]))
  (wcar* (car/zadd "prevayler-state" 3 [3 3 -2081955313 {:op :inc}]))
  (wcar* (car/zadd "prevayler-state" 4 [4 4 695947906 {:op :inc}]))
  (wcar* (car/zrange "prevayler-state" "-inf" "0" "BYSCORE" "LIMIT" "0" "1"))
  #_(wcar* (car/zrange "prevayler-state" "(0" "+inf" "BYSCORE")))

(wcar* (car/zscan "prevayler-state" 0))

(defn ->handler
  [f]
  (fn [[offset user-state] event timestamp next-offset]
    (assert (= (inc offset) next-offset) "Offsets should be a continuos sequence of natural number starting from 0")
    [next-offset (f user-state event timestamp)]))

(defn- restore! [handler state-atom store-key]
  (let [states (wcar* (car/zrange store-key "-inf" "0" "BYSCORE" "LIMIT" "0" "1"))]
    (when (seq states)
      (let [[[neg-offset previous-state]] states]
        (reset! state-atom [(abs neg-offset) previous-state])))
    (let [start-index (str "(" (-> state-atom deref first))
          new-events (wcar* (car/zrange store-key start-index "+inf" "BYSCORE"))]
      (doseq [[offset timestamp expected-state-hash event] new-events]
        (let [state (swap! state-atom handler event timestamp offset)]
          (when (and expected-state-hash ; Old prevayler4 journals don't have this state hash saved (2023-11-01)
                     (not= (hash state) expected-state-hash))
            (throw (ex-info "Inconsistent state detected during event journal replay" {:hash (hash state)
                                                                                       :expected-state-hash expected-state-hash}))))))
    @state-atom))

(comment
  (let [handler (->handler (fn [state {:keys [op]} _timestamp]
                             (case op
                               :inc (update state :cnt inc))))
        state-atom (atom [0 {:cnt 0}])
        store-key "prevayler-state"]
    (restore! handler state-atom store-key)))

(defn- write-with-flush! [data-out value]
  (nippy/freeze-to-out! data-out value)
  (.flush data-out))

(defn- archive! [^File backup]
  (rename! backup (File. (str backup "-" (System/currentTimeMillis)))))

(defn- start-new-journal! [journal-file data-out-atom state backup-file]
  (reset! data-out-atom (-> journal-file FileOutputStream. BufferedOutputStream. DataOutputStream.))
  (write-with-flush! @data-out-atom state)
  (when backup-file
    (archive! backup-file)))

(defprotocol Prevayler
  (handle! [this event] "Journals the event, applies the business function to the state and the event; and returns the new state.")
  (snapshot! [this] "Creates a snapshot of the current state.")
  (timestamp [this] "Calls the timestamp-fn"))

(defn prevayler! [{:keys [initial-state business-fn timestamp-fn store-key snapshot-every]
                   :or {initial-state {}
                        timestamp-fn #(System/currentTimeMillis)
                        store-key "prevayler-state"
                        snapshot-every 10}}]
  (let [state-atom (atom [0 initial-state])]
    (restore! business-fn state-atom store-key)

    (let [data-out-atom (atom nil)]
      #_(start-new-journal! journal-file data-out-atom @state-atom backup)

      (reify
        Prevayler
        (handle! [this event]
          (locking this ; (I)solation: strict serializability.
            (let [current-state @state-atom
                  timestamp (timestamp-fn)
                  new-state (business-fn current-state event timestamp)] ; (C)onsistency: must be guaranteed by the handler. The event won't be journalled when the handler throws an exception.
              (when-not (identical? new-state current-state)
                (write-with-flush! @data-out-atom [timestamp event (hash new-state)]) ; (D)urability
                (reset! state-atom new-state)) ; (A)tomicity
              new-state)))

        (snapshot! [this]
          (locking this
            (.close @data-out-atom)
            (let [backup "" #_(produce-backup-file! journal-file)]
              #_(start-new-journal! journal-file data-out-atom @state-atom backup))))

        (timestamp [_] (timestamp-fn))

        IDeref (deref [_] @state-atom)

        Closeable (close [_] (.close @data-out-atom))))))
