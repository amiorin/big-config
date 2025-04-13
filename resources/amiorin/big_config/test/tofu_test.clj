(ns {{main/ns}}.tofu-test
  (:require
   [aero.core :refer [read-config]]
   [big-config.aero :as aero]
   [big-config.call :as call]
   [big-config.run :as run]
   [clojure.java.io :as io]
   [clojure.test :refer [deftest is testing]]
   [{{main/ns}}.aero-readers :refer [modules]]))

(def config "{{main/ns}}.edn")

(defn dynamic-modules []
  (reset! modules #{})
  (read-config (io/resource config))
  @modules)

(deftest main-stability-test
  (testing "checking if all dynamic files committed are equal to the test generated ones"
    (doall
     (for [module (dynamic-modules)]
       (let [opts {::aero/config config
                   ::aero/module module
                   ::aero/profile :prod
                   ::run/dir [:big-config.aero/join
                              "tofu/"
                              :big-config.tofu/aws-account-id "/"
                              :big-config.aero/module]}]
         (call/stability opts module)
         (is true))))))

(deftest catch-nils-test
  (testing "checking that the map doesn't contain nils"
    (doall
     (for [module (dynamic-modules)]
       (let [opts {::aero/config config
                   ::aero/module module
                   ::aero/profile :prod
                   ::run/dir [:big-config.aero/join
                              "tofu/"
                              :big-config.tofu/aws-account-id "/"
                              :big-config.aero/module]}]
         (call/catch-nils opts module)
         (is true))))))
