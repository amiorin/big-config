(ns big-config.workflow
  (:require [big-config.core :as core]
            [big-config.git :as git]
            [big-config.keys :as k]
            [big-config.lock :as lock]
            [big-config.pluggable :as pluggable]
            [big-config.render :as render]
            [big-config.run :as run]
            [big-config.unlock :as unlock]
            [big-config.utils :as u]
            [clojure.string :as str]))

(def start :big-config.workflow/start)
(def end :big-config.workflow/end)
(def lock-step :big-config.workflow/lock)
(def git-check :big-config.workflow/git-check)
(def render-step :big-config.workflow/render)
(def create :big-config.workflow/create)
(def delete :big-config.workflow/delete)
(def validate :big-config.workflow/validate)
(def describe :big-config.workflow/describe)
(def exec :big-config.workflow/exec)
(def git-push :big-config.workflow/git-push)
(def unlock-any :big-config.workflow/unlock-any)

(def print-step-fn
  (core/create-step-fn
   {:before-f (fn [step opts]
                (let [failed? (and (contains? opts k/exit) (not= 0 (get opts k/exit)))
                      prefix (if failed? "✖" "➜")
                      msg (case step
                            :big-config.workflow/lock (str "Lock (owner " (or (get opts k/lock-owner) "") ")")
                            :big-config.workflow/unlock-any "Unlock any"
                            :big-config.workflow/git-check "Checking if the working directory is clean"
                            :big-config.workflow/render (str "Rendering workflow: " (or (get opts k/wf-name) ""))
                            :big-config.run/run-cmd (str "Running:\n> " (or (first (get opts k/run-cmds [])) ""))
                            nil)]
                  (when msg
                    (binding [*out* *err*]
                      (println prefix msg)))))
    :after-f (fn [step opts]
               (when (and (pos? (get opts k/exit 0)) (#{:big-config.workflow/git-check :big-config.run/run-cmd} step))
                 (binding [*out* *err*]
                   (println "✖" (if (= step :big-config.workflow/git-check)
                                  "Working directory is NOT clean"
                                  (str "Failed running:\n> " (or (first (get opts k/run-cmds [])) "")))))))}))

(defn- resolve-fn [key opts & [default-value]]
  (if-let [f (get opts key)]
    (u/->fn f)
    (if (some? default-value)
      default-value
      (throw (ex-info (str "`" key "` not defined") opts)))))

(defn select-globals [opts]
  (let [globals (get opts :globals [k/env k/run-shell-opts k/render-module k/render-profile
                                    k/wf-prefix k/wf-object-prefix :globals])]
    (select-keys opts globals)))

(defn run-steps [step-fns opts]
  (let [globals-opts (select-globals opts)
        create-opts (merge (get opts k/wf-create-opts {}) globals-opts)
        delete-opts (merge (get opts k/wf-delete-opts {}) globals-opts)
        opts* (atom opts)
        queued-steps (atom (mapv #(if (k/namespace-of %) (k/normalize-keyword %) (k/qualify k/workflow-ns %))
                                  (get opts k/wf-steps [])))
        wf (pluggable/create-workflow-star
            {:first-step start
             :last-step end
             :wire-fn (fn [step]
                        (case step
                          :big-config.workflow/start [core/ok nil]
                          :big-config.workflow/lock [(fn [o] (lock/lock step-fns o)) nil]
                          :big-config.workflow/git-check [(fn [o] (git/check step-fns o)) nil]
                          :big-config.workflow/render [(fn [o] (render/templates step-fns o)) nil]
                          :big-config.workflow/create [(fn [o] ((resolve-fn k/wf-create-fn opts) step-fns o)) nil]
                          :big-config.workflow/delete [(fn [o] ((resolve-fn k/wf-delete-fn opts) step-fns o)) nil]
                          :big-config.workflow/validate [(fn [o] ((resolve-fn k/wf-validate-fn opts (fn [_s x] (core/ok x))) step-fns o)) nil]
                          :big-config.workflow/describe [(fn [o] ((resolve-fn k/wf-describe-fn opts (fn [_s x] (core/ok x))) step-fns o)) nil]
                          :big-config.workflow/exec [(fn [o] (run/run-cmds step-fns o)) nil]
                          :big-config.workflow/git-push [git/git-push nil]
                          :big-config.workflow/unlock-any [(fn [o] (unlock/unlock-any step-fns o)) nil]
                          :big-config.workflow/end [identity nil]
                          [identity nil]))
             :next-fn (fn [step _next-step step-opts]
                        (if (#{create delete} step)
                          (swap! opts* #(assoc %
                                                k/exit (get step-opts k/exit)
                                                k/err (get step-opts k/err)
                                                step (conj (vec (get % step [])) step-opts)))
                          (reset! opts* step-opts))
                        (cond
                          (= step end) [nil @opts*]
                          (pos? (get step-opts k/exit 0)) [end @opts*]
                          :else (let [next-step (first @queued-steps)]
                                  (swap! queued-steps #(vec (rest %)))
                                  (if next-step
                                    [next-step (cond
                                                 (= next-step create) create-opts
                                                 (= next-step delete) delete-opts
                                                 :else @opts*)]
                                    [end @opts*]))))})]
    (wf step-fns @opts*)))

(def parse-arg-steps #{"lock" "git-check" "render" "create" "delete" "validate" "describe" "exec" "git-push" "unlock-any"})
(def ^:dynamic *parse-args-steps* parse-arg-steps)

(defn- tokenize [str-or-args]
  (cond
    (string? str-or-args) (let [trimmed (str/trim str-or-args)]
                            (if (str/blank? trimmed) [] (str/split trimmed #"\s+")))
    (nil? str-or-args) []
    :else (mapv str str-or-args)))

(defn parse-args [str-or-args]
  (loop [xs (vec (tokenize str-or-args))
         steps []
         cmds []]
    (if (empty? xs)
      {k/wf-steps steps k/run-cmds cmds}
      (let [token (first xs)
            token-kw (k/normalize-keyword token)
            token-name (k/name-of token-kw)]
        (cond
          (and (contains? parse-arg-steps token-name) (nil? (k/namespace-of token-kw)))
          (recur (subvec xs 1) (conj steps (keyword token-name)) cmds)

          (= token "--")
          (let [rest-args (subvec xs 1)]
            (when (empty? rest-args)
              (throw (ex-info "-- cannot be without a command" {})))
            {k/wf-steps (cond-> steps (not (some #{:exec} steps)) (conj :exec))
             k/run-cmds (conj cmds (str/join " " rest-args))})

          :else
          (recur (subvec xs 1)
                 (cond-> steps (not (some #{:exec} steps)) (conj :exec))
                 (conj cmds (str/replace token ":" " "))))))))

(defn- parse-path [path]
  (vec (remove str/blank? (str/split (str path) #"/"))))

(defn- build-path [parts profile suffix]
  (str/join "/" (concat parts [(str profile "-" suffix)])))

(defn new-prefix [opts first-step]
  (let [prefix (or (get opts k/wf-prefix) ".dist")
        object-prefix (or (get opts k/wf-object-prefix) "tofu")
        profile (or (get opts k/render-profile) "default")
        dirs (parse-path prefix)
        object-dirs (parse-path object-prefix)
        last-dir (or (peek dirs) "")
        profile-found? (str/starts-with? last-dir (str profile))
        prev-hash (if profile-found? (last (str/split last-dir #"-")) "")
        base-dirs (if profile-found? (pop dirs) dirs)
        base-object-dirs (if profile-found? (pop object-dirs) object-dirs)
        suffix (u/hash-string (str (k/key-string first-step) prev-hash) 8)]
    (assoc opts
           k/wf-prefix (build-path base-dirs profile suffix)
           k/wf-object-prefix (build-path base-object-dirs profile suffix))))

(defn path [opts name]
  (str (or (get opts k/wf-prefix) ".dist") "/" (u/keyword->path name)))

(defn prepare [opts overrides]
  (u/assert-args-present {:opts opts :overrides overrides :name (get opts k/wf-name)})
  (let [prefix (get overrides k/wf-prefix)
        object-prefix (get overrides k/wf-object-prefix)
        path-fn (or (get overrides k/wf-path-fn)
                    (fn [o] (str (or prefix ".dist") "/" (u/keyword->path (get o k/wf-name)))))
        object-fn (or (get overrides k/wf-object-fn)
                      (fn [o] (str (or object-prefix "tofu") "/" (u/keyword->name (get o k/wf-name)))))
        merged (merge opts overrides)
        dir (path-fn merged)
        object (object-fn merged)
        params (get overrides k/wf-params {})
        templates (mapv #(merge % params {:target-dir dir :target-object object})
                        (get merged k/render-templates []))]
    (assoc merged
           k/render-templates templates
           k/run-shell-opts (merge (get merged k/run-shell-opts {}) {:dir dir}))))

(defn merge-params [tools params opts]
  (reduce (fn [out tool]
            (reduce (fn [out root]
                      (let [existing (get-in out [root tool k/wf-params] {})]
                        (assoc-in out [root tool k/wf-params] (merge params existing))))
                    out
                    [k/wf-create-opts k/wf-delete-opts]))
          opts
          tools))

(def env-prefix "BC_PAR_")

(defn read-bc-pars
  ([opts] (read-bc-pars opts (System/getenv)))
  ([opts env]
   (let [params-from-env (into {}
                               (for [[ek ev] env
                                     :let [ek (name ek)]
                                     :when (and (str/starts-with? ek env-prefix) (some? ev))]
                                 [(-> ek
                                      (subs (count env-prefix))
                                      str/lower-case
                                      (str/replace "_" "-")
                                      (str/replace "." "-")
                                      keyword)
                                  ev]))]
     (assoc opts k/wf-params (merge (get opts k/wf-params {}) params-from-env)))))

(defonce workflow-registry (atom {}))

(defn register-workflow [name workflow]
  (swap! workflow-registry assoc (k/normalize-keyword name) workflow))

(defn unregister-workflow [name]
  (swap! workflow-registry dissoc (k/normalize-keyword name)))

(defn create-workflow-star [{:keys [first-step last-step pipeline firstStep lastStep]}]
  (let [first-step (k/normalize-keyword (or first-step firstStep))
        last-step (some-> (or last-step lastStep) k/normalize-keyword)]
    (when-not first-step
      (throw (IllegalArgumentException. ":first-step is required")))
    (when-not (vector? pipeline)
      (throw (IllegalArgumentException. ":pipeline must be like [::tool/tofu ...\n::tool/ansible ...")))
    (fn workflow*
      ([] [first-step (or last-step (if-let [ns (k/namespace-of first-step)] (keyword ns "end") :end))])
      ([step-fns opts]
       (let [actual-last-step (or last-step (if-let [ns (k/namespace-of first-step)] (keyword ns "end") :end))
             globals-opts (new-prefix (select-globals opts) first-step)
             pairs (partition 2 pipeline)
             step->opts-and-fn (into {}
                                      (for [[step tuple] pairs
                                            :let [step (k/normalize-keyword step)
                                                  tuple (if (sequential? tuple) (vec tuple) [tuple])
                                                  args (or (first tuple) [])
                                                  opts-fn (if (nil? (second tuple)) identity (u/->fn (second tuple)))
                                                  step-opts (get opts (k/add-suffix step "-opts") {})]]
                                        [step [(merge (parse-args args) globals-opts step-opts) opts-fn]]))
             steps (mapv (comp k/normalize-keyword first) pairs)
             steps-set (set steps)
             sequence (vec (concat [first-step] steps [actual-last-step nil]))
             step->next (into {} (map vector sequence (rest sequence)))
             opts* (atom opts)
             step->fn (fn [step]
                        (cond
                          (= step first-step) core/ok
                          (= step actual-last-step) identity
                          :else (let [registered (or (get @workflow-registry step) (get opts step))]
                                  (when-not (fn? registered)
                                    (throw (ex-info (str "Workflow '" step "' is not registered") {:step step})))
                                  (fn [o] (registered step-fns o)))))
             wf (pluggable/create-workflow-star
                 {:first-step first-step
                  :last-step actual-last-step
                  :wire-fn (fn [step] [(step->fn step) (get step->next step)])
                  :next-fn (fn [step next-step step-opts]
                             (if (contains? steps-set step)
                               (reset! opts* (assoc @opts*
                                                    k/exit (get step-opts k/exit)
                                                    k/err (get step-opts k/err)
                                                    step step-opts))
                               (reset! opts* step-opts))
                             (cond
                               (or (= step actual-last-step) (= step end)) [nil @opts*]
                               (pos? (get step-opts k/exit 0)) [actual-last-step @opts*]
                               :else (let [[new-opts opts-fn] (get step->opts-and-fn next-step [@opts* identity])]
                                       [next-step (opts-fn new-opts)])))})]
         (wf step-fns opts))))))

(def ->workflow* create-workflow-star)

(u/register-function 'big-config.workflow/run-steps run-steps)
(u/register-function 'big-config.workflow/parse-args parse-args)
(u/register-function 'big-config.workflow/prepare prepare)
