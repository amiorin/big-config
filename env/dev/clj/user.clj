(ns user
  (:require
   [app.main :refer [-main]]
   [babashka.fs :as fs]
   [babashka.process :as p]
   [clj-reload.core :as reload]
   [hyperlith.core :as h]))

(defonce ^:dynamic *server* nil)

(defn start! []
  (alter-var-root #'*server*
                  (fn [current-server]
                    (if current-server
                      current-server
                      (-main)))))

(defn stop! []
  (alter-var-root #'*server*
                  (fn [current-server]
                    (when current-server
                      ((current-server :stop)))
                    nil)))

(comment
  (-> *server*)
  (start!)
  (stop!))

(defn start-watcher! []
  (let [running_ (atom true)
        path ".reload"]
    (h/thread
      (while @running_
        (println "check")
        (Thread/sleep 1000)
        (when (fs/exists? path)
          (p/sh (format "touch %s" "src/app/fragments.clj"))
          (stop!)
          (reload/reload)
          (start!)
          (fs/delete path)
          (println "reload"))))
    (fn stop-tick! [] (reset! running_ false))))

(comment
  (def stop-watcher! (start-watcher!))
  (stop-watcher!))
