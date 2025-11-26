(ns app.main
  (:gen-class)
  (:require
   [app.actions :refer [job-name]]
   [app.business :as b :refer [->nonce]]
   [app.fragments :as f]
   [big-config.store :refer [store!]]
   [clojure.pprint :as pp]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(defn render-lines [lines]
  (for [[id content] (reverse @lines)]
    [:span {:id id
            :data-init "el.nextElementSibling && isFullyInViewport(el.nextElementSibling) && el.scrollIntoView()"} (str id ": " content)]))

(defview handler-home {:path "/" :shim-headers f/shim-headers}
  [{:keys [counter p] :as _req}]
  (let [running (-> @p
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
      [:div {:data-signals:theme (format "'%s'" (:theme @p))
             :data-signals:debug (format "%s" (:debug @p))
             :data-init "el.parentElement.parentElement.parentElement.setAttribute('data-theme', $theme); el.remove()"}]
      [:section#tables.container
       [:h2#counter @counter]]
      [:section#debug.container
       {:data-show "$debug"}
       [:pre
        {:data-json-signals true}]
       [:pre
        (with-out-str
          (pp/pprint @p))]]])))

(defn start-tick! [tx-batch!]
  (let [running_ (atom true)]
    (h/thread
      (while @running_
        (Thread/sleep 100)
        (tx-batch!
         (fn [{:keys [p nonce job-name counter]}]
           (swap! counter inc)
           (if (b/refresh? :state p :nonce nonce :job-name job-name)
             (swap! counter inc)
             (do
               (reset! counter 0)
               (if (b/accept? :state p :nonce nonce :job-name job-name)
                 (reset! counter 1000)
                 (reset! counter 0))))))))
    (fn stop-tick! [] (reset! running_ false))))

(defn ctx-start []
  (let [p_ (store! {:business-fn b/my-business
                    :initial-state b/initial-state
                    :store-key (str "counter-" (abs (->nonce)))})
        counter_ (atom 0)
        nonce_ (atom (->nonce))
        tx-batch!   (h/batch!
                     (fn [thunks]
                       (run! (fn [thunk] (thunk {:p p_
                                                 :counter counter_
                                                 :nonce nonce_
                                                 :job-name job-name})) thunks)
                       (h/refresh-all!))
                     {:run-every-ms 100})]
    {:p p_
     :counter counter_
     :tx-batch! tx-batch!
     :stop-tick (start-tick! tx-batch!)}))

(defn -main [& _]
  (h/start-app
   {:max-refresh-ms 100
    :port           (h/env :port)
    :ctx-start      ctx-start
    :ctx-stop       (fn [{:keys [stop-tick]}] (stop-tick))
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
