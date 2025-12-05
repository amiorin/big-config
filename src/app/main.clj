(ns app.main
  (:gen-class)
  (:require
   [app.actions :refer [job-name]]
   [app.business :as b :refer [->nonce]]
   [app.fragments :as f]
   [app.colors :as colors]
   [babashka.process :as p]
   [big-config.store :refer [handle! store!]]
   [clojure.java.io :as io]
   [clojure.string :as str]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(defn render-lines [lines]
  (-> (str/join "\n" lines)
      colors/text->hiccup))

(defview handler-home {:path "/" :shim-headers f/shim-headers}
  [{:keys [state] :as _req}]
  (let [running (-> @state
                    (get :jobs {})
                    (get job-name {})
                    (get :state)
                    (= :running))
        lines (-> @state
                  :jobs-lines
                  (get job-name []))]
    (h/html
     [:main#main])))

(defn start-task! [state job-name]
  (let [number-stream (p/process
                       {:dir "task"
                        :err :out
                        :shutdown p/destroy-tree}
                       "bb lines.clj")]
    (h/thread
      (with-open [rdr (io/reader (:out number-stream))]
        (binding [*in* rdr]
          (handle! state [:reset-lines {:job-name job-name}])
          (loop []
            (if-let [line (read-line)]
              (do (handle! state [:add-line {:job-name job-name :line line}])
                  (recur))
              (p/destroy-tree number-stream))))))
    (fn stop-task! []
      (handle! state [:reset-lines {:job-name job-name}])
      (p/destroy-tree number-stream))))

(comment
  (def state (store! {:business-fn b/my-business
                      :store-key (str "test-" (abs (->nonce)))
                      :wcar-opts {:pool :none}}))
  (def job-name "tofu")
  (def task (start-task! state job-name))
  (-> @state
      :jobs-lines
      (get "tofu"))
  (-> task))

(defn start-worker! [state job-name]
  (let [running (atom true)
        stop-task! (atom (constantly nil))
        nonce (atom (->nonce))]
    (h/thread
      (while @running
        (let [lines (-> @state
                        :jobs-lines
                        (get job-name []))]
          (Thread/sleep 100)
          (handle! state [:reset-job {:job-name job-name :delta 5000}])
          (if (> (count lines) 1000)
            (do (@stop-task!)
                (handle! state [:stop-job {:job-name job-name}]))
            (if (b/refresh? :state state :nonce nonce :job-name job-name)
              nil
              (if (b/accept? :state state :nonce nonce :job-name job-name)
                (reset! stop-task! (start-task! state job-name))
                (@stop-task!)))))))
    (fn stop-worker! []
      (@stop-task!)
      (reset! running false))))

(defn start-tick! [tx-batch!]
  (let [running_ (atom true)]
    (h/thread
      (while @running_
        (Thread/sleep 100)
        (tx-batch! (fn [& _]))))
    (fn stop-tick! [] (reset! running_ false))))

(defn ctx-start []
  (let [store-key "counter-fixed-v4" #_(str "counter-" (abs (->nonce)))
        state_ (store! {:business-fn b/my-business
                        :initial-state b/initial-state
                        :store-key store-key})
        _ (handle! state_ [:merge {:store-key store-key}])
        tx-batch!   (h/batch!
                     (fn [thunks]
                       (run! (fn [thunk] (thunk {:state state_})) thunks)
                       (h/refresh-all!))
                     {:run-every-ms 100})]
    {:state state_
     :tx-batch! tx-batch!
     :stop-tick (start-tick! tx-batch!)
     :stop-worker (start-worker! state_ job-name)}))

(defn -main [& _]
  (h/start-app
   {:max-refresh-ms 100
    :port           (h/env :port)
    :ctx-start      ctx-start
    :ctx-stop       (fn [{:keys [stop-tick :stop-worker]}]
                      (stop-tick)
                      (stop-worker))
    :csrf-secret    (h/env :csrf-secret)}))

(comment
  (def app (-main))

  (clojure.java.browse/browse-url "http://localhost:8080/")

  ;; stop server

  ((app :stop)))
