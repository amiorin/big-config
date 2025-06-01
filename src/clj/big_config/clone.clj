(ns big-config.clone
  (:require
   [big-config :as bc]
   [big-config.core :refer [->step-fn ->workflow]]
   [big-config.run :as run :refer [generic-cmd]]
   [big-config.step-fns :refer [->exit-step-fn]]
   [bling.core :refer [bling]]
   [clojure.string :as str]
   [selmer.parser :as p]
   [selmer.util :as util]))

(defn bling-print [color prefix msg]
  (binding [*out* *err*]
    (println (bling [color (p/render (str "{{ prefix }} " msg) {:prefix prefix})]))))

(def print-step-fn
  (->step-fn {:before-f (fn [step opts]
                          (binding [util/*escape-variables* false]
                            (let [msg (cond
                                        (= step ::mkdir) (p/render "Creating temp directory" opts)
                                        (= step ::run/run-cmd) (p/render "Running:\n> {{ big-config..run/cmds | first}}" opts)
                                        :else nil)]
                              (when msg
                                (bling-print :green.bold "\ueabc" msg)))))
              :after-f (fn [step {:keys [::bc/exit] :as opts}]
                         (let [msg (cond
                                     (and (> exit 0) (= step ::run/run-cmd)) (p/render "Failed running:\n> {{ big-config..run/cmds | first }}" opts)
                                     :else nil)]
                           (when msg
                             (bling-print :green.red "\uf05c" msg)))
                         (let [msg (cond
                                     (and (= exit 0) (= step ::mkdir)) (p/render "cd {{ big-config..clone/dir }}" opts)
                                     :else nil)]
                           (when msg
                             (bling-print :green.bold "\ueabc" msg))))}))

(defn mkdir [opts]
  (let [{:keys [::dir] :as opts} (generic-cmd :opts opts
                                              :cmd "mktemp -d"
                                              :key ::dir)
        dir (str/trim-newline dir)
        shell-opts {::run/shell-opts {:dir dir}}]
    (merge opts shell-opts)))

(defn clean [{:keys [::dir] :as opts}]
  (generic-cmd :opts opts
               :cmd (format "rm -rf %s" dir)))

(def run-clone
  (->workflow {:first-step ::mkdir
               :wire-fn (fn [step step-fns]
                          (case step
                            ::mkdir [mkdir ::run-cmds]
                            ::run-cmds [(partial run/run-cmds step-fns) ::clean]
                            ::clean [clean ::end]
                            ::end [identity]))}))

(defn main [{[action module profile] :args
                      step-fns :step-fns
                      repo :repo
                      env :env}]
  (let [ctx {::repo repo
             ::action (name action)
             ::module (name module)
             ::profile (name profile)}
        env (or env :shell)
        step-fns (or step-fns [(->exit-step-fn ::end)
                               print-step-fn])
        cmds ["git clone {{ big-config..clone/repo }} ."
              "just tofu {{ big-config..clone/action }} {{ big-config..clone/module }} {{ big-config..clone/profile }}"]
        opts {::bc/env env
              ::run/cmds (for [cmd cmds]
                           (p/render cmd ctx))}]
    (->> (run-clone step-fns opts)
         (into (sorted-map)))))
