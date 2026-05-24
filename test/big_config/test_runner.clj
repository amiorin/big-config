(ns big-config.test-runner
  (:require [big-config.core-test]
            [big-config.workflow-test]
            [big-config.run-test]
            [big-config.render-test]
            [big-config.lock-test]
            [big-config.big-tofu-test]
            [clojure.test :as t]))

(defn -main [& _]
  (let [{:keys [fail error]} (t/run-tests 'big-config.core-test
                                           'big-config.workflow-test
                                           'big-config.run-test
                                           'big-config.render-test
                                           'big-config.lock-test
                                           'big-config.big-tofu-test)]
    (System/exit (if (zero? (+ fail error)) 0 1))))
