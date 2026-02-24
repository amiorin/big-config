(ns big-config.step-fns-test
  (:require
   [babashka.process :as process]
   [big-config.core :refer [->step-fn ->workflow ok]]
   [big-config.step-fns :refer [->exit-step-fn]]
   [clojure.string :as str]
   [clojure.test :refer [deftest is testing]]))

(defn wf-exit []
  (let [step-fns [(->exit-step-fn ::end)
                  (->step-fn {:before-f (fn [step _]
                                          (println step))
                              :after-f :same})
                  (->step-fn {:before-f (fn [step _]
                                          (when (= step ::wf1-start)
                                            (throw (ex-info "Error" {}))))})]
        wf1 (->workflow {:first-step ::wf1-start
                         :last-step ::wf1-end
                         :wire-fn (fn [step _]
                                    (case step
                                      ::wf1-start [#(ok %) ::wf1-end]
                                      ::wf1-end [identity]))})
        wf2 (->workflow {:first-step ::start
                         :wire-fn (fn [step step-fns]
                                    (case step
                                      ::start [(partial wf1 step-fns) ::end]
                                      ::end [identity]))})]
    (wf2 step-fns {})))

(deftest ->exit-step-fn-test
  (testing "->exit-step-fn work in a nested wf with a step that throws"
    (let [expect [1 ":big-config.step-fns-test/start\n:big-config.step-fns-test/wf1-end\n:big-config.step-fns-test/wf1-end\n:big-config.step-fns-test/start\n:big-config.step-fns-test/end\n:big-config.step-fns-test/end\n"]
          proc (process/shell {:continue true
                               :out :string
                               :err :string} "just test-wf-exit")
          {:keys [exit out]} proc
          actual [exit out]]
      (doseq [[f a e] (map list [= str/includes?] actual expect)]
        (is (f a e) (format "f is %s, a is %s, and e is %s" f a e) )))))

(comment
  (wf-exit))

; to avoid infinite loops, do not write expressions in this file because it is
; required by the test. To debug this test use `user`.
