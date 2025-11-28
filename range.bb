(defn slow-range
  ([] (slow-range 0)) ;; Default to starting at 0
  ([n]
   (lazy-seq
     (Thread/sleep 1000) ;; Sleep for 1000ms (1 second)
     (cons n (slow-range (inc n)))))) ;; Return n, then recurse

(slow-range)
