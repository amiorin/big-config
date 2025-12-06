(ns user
  (:require
   [app.main :refer [-main]]
   [babashka.fs :as fs]
   [babashka.process :as p]
   [clj-reload.core :as reload]
   [hyperlith.core :as h]))

(defonce server (atom nil))
(defonce watcher (atom nil))

(defn start! []
  (swap! server
         (fn [current-server]
           (if current-server
             current-server
             (-main)))))

(defn stop! []
  (swap! server
         (fn [current-server]
           (when current-server
             (println "Stopping server...")
             ((:stop current-server)))
           nil)))

(comment
  @server   ;; Check server state
  (start!)
  (stop!))

(defn watcher! []
  (let [running_ (atom true)
        path ".reload"]
    (h/thread
      (while @running_
        (Thread/sleep 1000)
        (when (fs/exists? path)
          (p/sh (format "touch %s" "src/app/fragments.clj"))
          (stop!)
          (reload/reload)
          (start!)
          (fs/delete path))))
    (fn stop-watcher! [] (reset! running_ false))))

(defn start-watcher! []
  (swap! watcher
         (fn [current-watcher]
           (if current-watcher
             current-watcher
             (watcher!)))))

(defn stop-watcher! []
  (swap! watcher
         (fn [current-watcher]
           (when current-watcher
             (current-watcher))
           nil)))

(comment
  @watcher
  (start-watcher!)
  (stop-watcher!))
