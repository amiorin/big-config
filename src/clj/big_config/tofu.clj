(ns big-config.tofu
  (:require
   [big-config :as bc]
   [big-config.action :as action]
   [big-config.aero :as aero]
   [big-config.call :as call]
   [big-config.core :refer [->step-fn ->workflow choice ok]]
   [big-config.git :as git]
   [big-config.lock :as lock]
   [big-config.run :as run :refer [generic-cmd]]
   [big-config.step-fns :refer [->exit-step-fn log-step-fn tap-step-fn]]
   [big-config.unlock :as unlock]
   [bling.core :refer [bling]]
   [clojure.pprint :as pp]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [selmer.parser :as p]
   [selmer.util :as util]))

(def print-step-fn
  (->step-fn {:before-f (fn [step {:keys [::bc/err
                                          ::bc/exit] :as opts}]
                          (binding [util/*escape-variables* false]
                            (let [[lock-start-step] (lock/lock)
                                  [unlock-start-step] (unlock/unlock-any)
                                  [check-start-step] (git/check)
                                  [prefix color] (if (= exit 0)
                                                   ["\ueabc" :green.bold]
                                                   ["\uf05c" :red.bold])
                                  msg (cond
                                        (= step ::read-module) (p/render "Action {{ big-config..tofu/action|default:nil }} | Module {{ big-config..aero/module|default:nil }} | Profile {{ big-config..aero/profile|default:nil }} | Config {{ big-config..aero/config|default:nil }}" opts)
                                        (= step ::mkdir) (p/render "Making dir {{ big-config..run/dir }}" opts)
                                        (= step lock-start-step) (p/render "Lock (owner {{ big-config..lock/owner }})" opts)
                                        (= step unlock-start-step) "Unlock any"
                                        (= step check-start-step) "Checking if the working directory is clean"
                                        (= step ::compile-tf) (p/render "Compiling {{ big-config..run/dir }}/main.tf.json" opts)
                                        (= step ::run/run-cmd) (p/render "Running:\n> {{ big-config..run/cmds | first}}" opts)
                                        (= step ::call/call-fn) (p/render "Calling fn: {{ desc }}" (first (::call/fns opts)))
                                        (= step ::push) "Pushing last commit"
                                        (and (= step ::end)
                                             (> exit 0)
                                             (string? err)
                                             (not (str/blank? err))) err
                                        :else nil)]
                              (when msg
                                (binding [*out* *err*]
                                  (println (bling [color (p/render (str "{{ prefix }} " msg) {:prefix prefix})])))))))
              :after-f (fn [step {:keys [::bc/exit] :as opts}]
                         (let [[_ check-end-step] (git/check)
                               prefix "\uf05c"
                               msg (cond
                                     (= step check-end-step) "Working directory is NOT clean"
                                     (= step ::run/run-cmd) (p/render "Failed running:\n> {{ big-config..run/cmds | first }}" opts)
                                     :else nil)]
                           (when (and msg
                                      (> exit 0))
                             (binding [*out* *err*]
                               (println (bling [:red.bold (p/render (str "{{ prefix }} " msg) {:prefix prefix})]))))))}))

(defn mkdir [{:keys [::run/dir] :as opts}]
  (generic-cmd :opts opts
               :cmd (format "mkdir -p %s" dir)))

(defn run-action [step-fns {:keys [::action] :as opts}]
  (let [opts (assoc opts ::run/cmds (case action
                                      :clean ["rm -rf .terraform"]
                                      (:opts :lock :unlock-any) []
                                      (:init :plan :apply :destroy) [(format "tofu %s" (name action))]
                                      :reset ["rm -rf .terraform" "tofu init" "tofu plan"]
                                      :auto-apply ["tofu init" "tofu apply -auto-approve"]
                                      :ci ["tofu init" "tofu apply -auto-approve" "tofu destroy -auto-approve"]))]
    (case action
      :opts (do (pp/pprint (into (sorted-map) opts))
                (ok opts))
      (apply (case action
               :clean run/run-cmds
               :lock lock/lock
               :unlock-any unlock/unlock-any
               (:init :plan :reset) run/run-cmds
               (:auto-apply :apply :destroy :ci) (partial action/run-action-with-lock action)) [step-fns opts]))))

(defn block-destroy-prod-step-fn [start-step]
  (->step-fn {:before-f (fn [step {:keys [::action ::aero/profile] :as opts}]
                          (let [msg (p/render "You cannot destroy module {{ big-config..aero/module }} in {{ big-config..aero/profile }}" opts)]
                            (when (and (= step start-step)
                                       (#{:destroy :ci} action)
                                       (#{:prod :production} profile))
                              (throw (ex-info msg opts)))))}))

(s/def ::bc/env keyword?)
(s/def ::call/f string?)
(s/def ::call/desc string?)
(s/def ::call/args (s/coll-of any?))
(s/def ::call/fn (s/keys :req-un [::call/f ::call/desc ::call/args]))
(s/def ::call/fns (s/coll-of ::call/fn))
(s/def ::lock/lock-keys (s/coll-of keyword?))
(s/def ::lock/owner string?)
(s/def ::run/dir string?)
(s/def ::run/shell-opts (s/map-of keyword? any?))
(s/def ::aws-account-id string?)
(s/def ::region string?)
(s/def ::opts (s/keys :req [::bc/env
                            ::call/fns
                            ::lock/lock-keys
                            ::lock/owner
                            ::run/dir
                            ::run/shell-opts
                            ::aws-account-id
                            ::region]))

(defn spec->msg [spec opts]
  (let [msg (s/explain-str spec opts)
        start-index (str/index-of msg "failed:")]
    (if start-index
      (subs msg start-index)
      (p/render "Validation error in config {{ big-config..aero/config }}" opts))))

(defn validate [spec opts]
  (let [parsed-opts (s/conform spec opts)]
    (if (s/invalid? parsed-opts)
      (throw (ex-info (spec->msg spec opts) opts))
      parsed-opts)))

(def run-tofu
  (->workflow {:first-step ::start
               :wire-fn (fn [step step-fns]
                          (case step
                            ::start [ok ::read-module]
                            ::read-module [aero/read-module ::validate]
                            ::validate [(partial validate ::opts) ::mkdir]
                            ::mkdir [mkdir ::call-fns]
                            ::call-fns [(partial call/call-fns step-fns) ::run-action]
                            ::run-action [(partial run-action step-fns) ::end]
                            ::end [identity]))
               :next-fn (fn [step next-step {:keys [::action ::exit] :as opts}]
                          (cond
                            (= step ::end) [nil opts]
                            (and (= action :clean)
                                 (= exit 0)
                                 (= step ::mkdir))  [::run-action opts]
                            (and (= step ::read-module)
                                 (= exit 0)
                                 (#{:opts :lock :unlock-any} action)) [::run-action opts]
                            :else (choice {:on-success next-step
                                           :on-failure ::end
                                           :opts opts})))}))

(defn stack-trace-step-fn [f step {:keys [::bc/stack-trace] :as opts}]
  (when stack-trace
    (println stack-trace))
  (f step opts))

(defn ^:export main [{[action module profile] :args
                      step-fns :step-fns
                      config :config
                      env :env}]
  (let [action action
        module module
        profile profile
        step-fns (or step-fns [stack-trace-step-fn
                               print-step-fn
                               (block-destroy-prod-step-fn ::start)
                               (->exit-step-fn ::end)])
        env (or env :shell)]
    (->> (run-tofu step-fns {::action action
                             ::bc/env (or env :shell)
                             ::aero/config config
                             ::aero/module module
                             ::aero/profile profile})
         (into (sorted-map)))))

(comment
  (require '[user :refer [debug-atom]])
  (main {:args [:plan :alpha :dev]
         :config "big-infra/big-config.edn"
         :step-fns [stack-trace-step-fn
                    print-step-fn
                    (block-destroy-prod-step-fn ::start)
                    (->exit-step-fn ::end)]
         :env :repl})

  (reset! debug-atom [])
  (-> debug-atom))
