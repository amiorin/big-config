(ns app.main
  (:gen-class)
  (:require
   [app.actions :refer [job-name]]
   [app.business :as b :refer [->nonce]]
   [app.fragments :as f]
   [big-config.store :refer [handle! store!]]
   [clojure.pprint :as pp]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(defn render-lines [lines]
  (for [[id content] (reverse @lines)]
    [:span {:id id
            :data-init "el.nextElementSibling && isFullyInViewport(el.nextElementSibling) && el.scrollIntoView()"} (str id ": " content)]))

(defview handler-home {:path "/" :shim-headers f/shim-headers}
  [{:keys [state] :as _req}]
  (let [running (-> @state
                    (get :jobs {})
                    (get job-name {})
                    (get :state)
                    (= :running))]
    (h/html
     [:link#css {:rel "stylesheet" :type "text/css" :href f/css}]
     [:link#theme {:rel "stylesheet" :type "text/css" :href f/theme}]
     [:link#css-lines {:rel "stylesheet" :type "text/css" :href f/css-lines}]
     [:script#myjs {:defer true :type "module" :src f/myjs}]
     (f/header :running running)
     [:main#main
      [:div {:data-signals:theme (format "'%s'" (:theme @state))
             :data-signals:debug (format "%s" (:debug @state))
             :data-init "el.parentElement.parentElement.parentElement.setAttribute('data-theme', $theme); el.remove()"}]
      [:section#tables.container
       [:h2#counter (:counter @state)]]
      [:section#debug.container
       {:data-show "$debug"}
       [:pre
        {:data-json-signals true}]
       [:pre
        (with-out-str
          (pp/pprint @state))]]])))

(defn start-worker! [state job-name]
  (let [running_ (atom true)
        nonce (atom (->nonce))]
    (h/thread
      (while @running_
        (Thread/sleep 1000)
        (handle! state [:reset-job {:job-name job-name
                                    :delta 5000}])
        (if (> (:counter @state) 1010)
          (do (handle! state [:stop-job {:job-name job-name}])
              (handle! state [:reset-counter 0]))
          (if (b/refresh? :state state :nonce nonce :job-name job-name)
            (handle! state [:inc-counter])
            (if (b/accept? :state state :nonce nonce :job-name job-name)
              (handle! state [:reset-counter 1000])
              (println "kill the job"))))))
    (fn stop-worker! [] (reset! running_ false))))

(defn start-tick! [tx-batch!]
  (let [running_ (atom true)]
    (h/thread
      (while @running_
        (Thread/sleep 100)
        (tx-batch! (fn [& _]))))
    (fn stop-tick! [] (reset! running_ false))))

(defn ctx-start []
  (let [store-key "counter-fixed-v2" #_(str "counter-" (abs (->nonce)))
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

;; Refresh app when you re-eval file
(h/refresh-all!)

(comment
  (def app (-main))

  (clojure.java.browse/browse-url "http://localhost:8080/")

  ;; stop server

  ((app :stop))

  (-> app
      :ctx
      :p
      deref
      #_(handle! [:stop-job {:job-name "tofu"}])))
