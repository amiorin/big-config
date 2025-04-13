(ns user
  (:require
   [big-config.step-fns :as step-fns]
   [big-config.tofu :as tofu]
   [clojure.spec.alpha :as s]
   [clojure.tools.namespace.repl :as repl]
   [expound.alpha :as expound]))

(alter-var-root #'s/*explain-out* (constantly expound/printer))

(repl/set-refresh-dirs "src/clj")

(defonce debug-atom (atom []))
(defn add-to-debug [x]
  (swap! debug-atom conj x))
(add-tap add-to-debug)

(comment
  (tofu/main {:args [:plan :alpha :prod]
              :config "big-config.edn"
              :step-fns [step-fns/tap-step-fn
                         tofu/print-step-fn
                         (partial tofu/block-destroy-prod-step-fn ::tofu/start)]
              :env :repl})

  (reset! debug-atom [])
  (-> debug-atom))
