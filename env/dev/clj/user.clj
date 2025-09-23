(ns user
  (:require
   [clojure.spec.alpha :as s]
   [clojure.tools.namespace.repl :as repl]
   [expound.alpha :as expound]
   [lambdaisland.classpath.watch-deps :as watch-deps]))

(watch-deps/start! {:aliases [:dev :test]})

(alter-var-root #'s/*explain-out* (constantly expound/printer))

(repl/set-refresh-dirs "src/clj" "env/dev/clj")

(defonce debug-atom (atom []))
(defn add-to-debug [x]
  (swap! debug-atom conj x))
(add-tap add-to-debug)

(comment
  (reset! debug-atom [])
  (-> @debug-atom))
