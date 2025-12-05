(ns dev
  (:require
   [babashka.process :refer [sh]]))

(require '[babashka.pods :as pods])
(pods/load-pod 'org.babashka/fswatcher "0.0.7")

(require '[pod.babashka.fswatcher :as fw])

(fw/watch "resources" (fn [{:keys [path]}]
                        (case path
                          "resources/myjs.js" (sh "touch" "src/app/fragments.clj")
                          (prn path))))

(println "Watching service started. Waiting...")

(deref (promise))
