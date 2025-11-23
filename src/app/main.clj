(ns app.main
  (:gen-class)
  (:require
   [app.fragments :as f]
   [big-config.store :refer [get-offset handle! store!]]
   [big-config.utils :refer [deep-merge]]
   [dev.onionpancakes.chassis.core :as c]
   [hyperlith.core :as h :refer [defaction defview]]))

(alter-var-root #'c/escape-attribute-value-fragment (constantly identity))

(defn render-lines [lines]
  (for [[id content] (reverse @lines)]
    [:span {:id id
            :data-init "el.nextElementSibling && isFullyInViewport(el.nextElementSibling) && el.scrollIntoView()"} (str id ": " content)]))

(defview handler-home {:path "/" :shim-headers f/shim-headers}
  [{:keys [counter db p lines] :as _req}]
  (h/html
   [:link#css {:rel "stylesheet" :type "text/css" :href f/css}]
   [:link#theme {:rel "stylesheet" :type "text/css" :href f/theme}]
   [:link#css-lines {:rel "stylesheet" :type "text/css" :href f/css-lines}]
   [:script#myjs {:defer true :type "module" :src f/myjs}]
   (f/header)
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
     (render-lines lines)]]))

(def initial-state
  {:theme "light"
   :debug false})

(defn my-business [state [op op-val] _timestamp]
  (case op
    :merge (deep-merge state op-val)
    :reset initial-state))

(defn start-counter! [tx-batch!]
  (let [running_ (atom true)]
    (h/thread
      (while @running_
        (Thread/sleep 100)
        (tx-batch!
         (fn [{:keys [counter lines]}]
           (swap! counter inc)
           (let [new-uid (h/new-uid)]
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
                       (run! (fn [thunk] (thunk {:counter counter_
                                                 :lines lines_})) thunks)
                       (h/refresh-all!))
                     {:run-every-ms 100})]
    {:db db_
     :p p_
     :counter counter_
     :lines lines_
     :tx-batch! tx-batch!
     :stop-counter (start-counter! tx-batch!)}))

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
  ((app :stop)))
