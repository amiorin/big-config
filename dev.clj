(ns dev)

(require '[babashka.pods :as pods])
(pods/load-pod 'org.babashka/fswatcher "0.0.5")

(require '[pod.babashka.fswatcher :as fw])

(def watcher (fw/watch "resources" (fn [event] (prn event))))

(println "Watching service started. Waiting...")

(deref (promise))

(println "Exiting...")
