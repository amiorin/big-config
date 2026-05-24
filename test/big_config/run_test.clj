(ns big-config.run-test
  (:require [big-config.keys :as k]
            [big-config.run :as run]
            [clojure.test :refer [deftest is use-fixtures]]))

(use-fixtures :each (fn [f] (try (f) (finally (run/reset-runner)))))

(deftest handles-command-results
  (let [res (run/handle-cmd {} {:exit 1 :out "\u001b[31mout\u001b[0m" :err "err" :cmd "x"})]
    (is (= 1 (get res k/exit)))
    (is (= "out" (-> res (get k/procs) first :out)))))

(deftest runs-multiple-commands-through-runner-seam
  (run/set-runner (fn [_shell-opts cmd]
                    (let [word (last (clojure.string/split (str cmd) #" "))]
                      {:exit 0 :out (str word "\n") :err "" :cmd cmd})))
  (let [res (run/run-cmds [] {k/env :repl
                              k/run-shell-opts {:continue true :err :string :out :string}
                              k/run-cmds ["echo one" "echo two" "echo three"]})]
    (is (= 0 (get res k/exit)))
    (is (= ["echo three"] (get res k/run-cmds)))
    (is (= ["one\n" "two\n" "three\n"] (mapv :out (get res k/procs))))))

(deftest generic-cmd-stores-keyed-stdout
  (let [res (run/with-runner (fn [_shell-opts cmd] {:exit 0 :out "value\n" :err "" :cmd cmd})
              #(run/generic-cmd {:opts {} :cmd ["echo" "value"] :key :x}))]
    (is (= "value" (:x res)))))

(deftest creates-and-removes-temp-dirs
  (let [made (run/mktemp-create-dir {})
        removed (run/mktemp-remove-dir made)]
    (is (string? (get made k/run-dir)))
    (is (= 0 (get removed k/exit)))))
