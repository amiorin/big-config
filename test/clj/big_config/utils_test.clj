(ns big-config.utils-test
  (:require
   [big-config :as bc]
   [big-config.core :refer [->workflow]]
   [big-config.run :as run]
   [clojure.test :refer [deftest is testing]]))

(defn test-step-fn [end-steps xs f step opts]
  (when (end-steps step)
    (swap! xs conj opts))
  (f step opts))

(def default-opts #:big-config.lock {:aws-account-id "111111111111"
                                     :region "eu-west-1"
                                     :ns "test.module"
                                     :fn "invoke"
                                     :owner "CI"
                                     :isolation (or (System/getenv "ZELLIJ_SESSION_NAME") "CI")
                                     :lock-keys [:big-config.lock/aws-account-id
                                                 :big-config.lock/region
                                                 :big-config.lock/ns
                                                 ;; to avoid to conflict with GitHub Actions and other develoers
                                                 :big-config.lock/isolation]
                                     ::run/run-cmd "true"
                                     ::bc/test-mode true
                                     ::bc/env :repl})

(defn a-step-fn [f step opts]
  (let [opts (update opts ::bc/steps (fnil conj []) [step :start-a])
        opts (f step opts)]
    (update opts ::bc/steps (fnil conj []) [step :end-a])))

(defn b-step-fn [f step opts]
  (let [opts (update opts ::bc/steps (fnil conj []) [step :start-b])
        opts (f step opts)]
    (update opts ::bc/steps (fnil conj []) [step :end-b])))

(deftest step-fns-test
  (testing "step-fns by name and by symbol"
    (let [expect {:big-config/err nil, :big-config/exit 0, :big-config/steps [[:big-config.utils-test/start :start-a] [:big-config.utils-test/start :start-b] [:big-config.utils-test/start :end-b] [:big-config.utils-test/start :end-a] [:big-config.utils-test/end :start-a] [:big-config.utils-test/end :start-b] [:big-config.utils-test/end :end-b] [:big-config.utils-test/end :end-a]], :big-config.utils-test/bar :baz}
          actual (->> ((->workflow {:first-step ::start
                                    :step-fns ["big-config.utils-test/a-step-fn"
                                               b-step-fn]
                                    :wire-fn (fn [step _]
                                               (case step
                                                 ::start [#(merge % {::bc/exit 0
                                                                     ::bc/err nil}) ::end]
                                                 ::end [identity]))}) {::bar :baz})
                      (into (sorted-map)))]
      (is (= expect actual)))))

#_(let [trace (fn [f step opts]
                (binding [*out* *err*]
                  (println (bling [:blue.bold step])))
                (f step (update opts ::bc/steps (fnil conj []) step)))

        halt (fn [halt-step f step opts]
               (if (= step halt-step)
                 (throw (ex-info "Halt" opts))
                 (f step opts)))
        exit (fn [f step {:keys [::bc/err] :as opts}]
               (when (= step ::end)
                 (binding [*out* *err*]
                   (println (bling [:red.bold err]))))
               (f step opts))
        wf (->workflow {:first-step ::start
                        :step-fns [trace
                                   (partial halt ::start)
                                   exit]
                        :wire-fn (fn [step _]
                                   (case step
                                     ::start [#(merge % {::bc/exit 0
                                                         ::bc/err nil}) ::middle]
                                     ::middle [#(merge % {::bc/exit 0
                                                          ::bc/err nil}) ::end]
                                     ::end [identity]))})]
    (->> (wf {::bar :baz})
         (into (sorted-map))))
#_(->> ((->workflow {:first-step ::foo
                     :wire-fn (fn [step _]
                                (case step
                                  ::foo [#(throw (Exception. "Java exception") #_%) ::end]
                                  ::end [identity]))}) [(->print-error-step-fn ::end)] {::bar :baz})
       (into (sorted-map)))

#_(->> ((->workflow {:first-step ::foo
                     :wire-fn (fn [step _]
                                (case step
                                  ::foo [#(throw (ex-info "Error" %)) ::end]
                                  ::end [identity]))
                     :next-fn ::end})
        {::bar :baz})
       (into (sorted-map)))

#_(try (throw (Exception. "Java exception"))
       (catch Exception e
         [(apply str (interpose "\n" (map str (.getStackTrace e))))]))
