(ns app.main
  (:gen-class)
  (:require
   [app.actions :refer [job-name]]
   [app.fragments :as f]
   [big-config.store :refer [get-offset store!]]
   [big-config.utils :refer [deep-merge]]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(defn render-lines [lines]
  (for [[id content] (reverse @lines)]
    [:span {:id id
            :data-init "el.nextElementSibling && isFullyInViewport(el.nextElementSibling) && el.scrollIntoView()"} (str id ": " content)]))

(defview handler-home {:path "/" :shim-headers f/shim-headers}
  [{:keys [counter db p lines tabid] :as _req}]
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
        {:data-json-signals true}]]
      [:pre#lines.container
       (render-lines lines)]])))

(def initial-state
  {:theme "light"
   :debug false
   :jobs {}})

(defn my-business [state [op op-val] timestamp]
  (case op
    :run-job (let [{:keys [job-name owner]} op-val
                   job (get-in state [:jobs job-name])]
               (if (or (not job)
                       (= (:owner job) owner)
                       (= (:state job) :stopped))
                 (assoc-in state [:jobs job-name] {:owner owner
                                                   :state :running
                                                   :timestamp timestamp})
                 state))
    :stop-job (let [{:keys [job-name]} op-val
                    job (get-in state [:jobs job-name])]
                (if job
                  (assoc-in state [:jobs job-name :state] :stopped)
                  state))
    :merge (deep-merge state op-val)
    :reset initial-state))

(defn start-tick! [tx-batch!]
  (let [running_ (atom true)]
    (h/thread
      (while @running_
        (Thread/sleep 100)
        (tx-batch!
         (fn [{:keys [p counter lines]}]
           (swap! counter inc)
           #_(let [new-uid (h/new-uid)]
               (when (> @counter 1000)
                 (reset! lines [])
                 (reset! counter 1))
               (swap! lines conj [@counter new-uid]))))))
    (fn stop-game! [] (reset! running_ false))))

(defn ctx-start []
  (let [p_ (store! {:business-fn my-business
                    :store-key "example"})
        db_  (atom (get-offset p_))
        lines_ (atom [])
        counter_ (atom 0)
        tx-batch!   (h/batch!
                     (fn [thunks]
                       (run! (fn [thunk] (thunk {:p p_
                                                 :counter counter_
                                                 :lines lines_})) thunks)
                       (h/refresh-all!))
                     {:run-every-ms 100})]
    {:db db_
     :p p_
     :counter counter_
     :lines lines_
     :tx-batch! tx-batch!
     :stop-counter (start-tick! tx-batch!)}))

(defn -main [& _]
  (h/start-app
   {:max-refresh-ms 100
    :port           (h/env :port)
    :ctx-start      ctx-start
    :ctx-stop       (fn [{:keys [stop-counter]}] (stop-counter))
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
