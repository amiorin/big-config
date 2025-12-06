(ns user
  (:require
   [app.main :refer [-main]]
   [babashka.process :as p]))

(defonce ^:dynamic *server* nil)

(defn start! []
  (alter-var-root #'*server*
                  (fn [current-server]
                    (if current-server
                      current-server
                      (-main)))))

(defn stop! []
  (p/sh {:out *out*
         :err :out
         :dir "bun"} "just compile")
  (alter-var-root #'*server*
                  (fn [current-server]
                    (when current-server
                      ((current-server :stop)))
                    nil)))

(comment
  (-> *server*)
  (start!)
  (stop!))
