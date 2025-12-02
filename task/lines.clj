(ns lines
  (:require
   [babashka.process :as p]
   [clojure.java.io :as io]))

(defn slow-range
  ([] (slow-range 0)) ;; Default to starting at 0
  ([n]
   (lazy-seq
    (Thread/sleep 100) ;; Sleep for 1000ms (1 second)
    (cons n (slow-range (inc n)))))) ;; Return n, then recurse

(defn lines []
  (let [lines-stream (p/process
                      {:err :out
                       :shutdown p/destroy-tree}
                      "bat --style plain -f core.clj")]
    (with-open [rdr (io/reader (:out lines-stream))]
      (binding [*in* rdr]
        (loop []
          (if-let [line (read-line)]
            (do (println line)
                (Thread/sleep 1000)
                (recur))
            (p/destroy-tree lines-stream)))))))

(lines)
