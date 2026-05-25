(ns big-config.keys
  (:refer-clojure :exclude [name namespace]))

(def exit :big-config/exit)
(def err :big-config/err)
(def stack-trace :big-config/stack-trace)
(def procs :big-config/procs)
(def steps-trace :big-config/steps)
(def env :big-config/env)

(def run-ns "big-config.run")
(def run-shell-opts :big-config.run/shell-opts)
(def run-cmds :big-config.run/cmds)
(def run-cmd :big-config.run/run-cmd)
(def run-dir :big-config.run/dir)

(def render-ns "big-config.render")
(def render-templates :big-config.render/templates)
(def render-module :big-config.render/module)
(def render-profile :big-config.render/profile)

(def workflow-ns "big-config.workflow")
(def wf-steps :big-config.workflow/steps)
(def wf-name :big-config.workflow/name)
(def wf-prefix :big-config.workflow/prefix)
(def wf-object-prefix :big-config.workflow/object-prefix)
(def wf-params :big-config.workflow/params)
(def wf-path-fn :big-config.workflow/path-fn)
(def wf-object-fn :big-config.workflow/object-fn)
(def wf-create-fn :big-config.workflow/create-fn)
(def wf-build-fn :big-config.workflow/build-fn)
(def wf-delete-fn :big-config.workflow/delete-fn)
(def wf-validate-fn :big-config.workflow/validate-fn)
(def wf-describe-fn :big-config.workflow/describe-fn)
(def wf-create-opts :big-config.workflow/create-opts)
(def wf-build-opts :big-config.workflow/build-opts)
(def wf-delete-opts :big-config.workflow/delete-opts)

(def lock-ns "big-config.lock")
(def lock-owner :big-config.lock/owner)
(def lock-keys :big-config.lock/lock-keys)
(def lock-details :big-config.lock/lock-details)
(def lock-name :big-config.lock/lock-name)
(def tag-content :big-config.lock/tag-content)

(def git-ns "big-config.git")
(def git-prev-revision :big-config.git/prev-revision)
(def git-current-revision :big-config.git/current-revision)
(def git-origin-revision :big-config.git/origin-revision)
(def git-upstream-name :big-config.git/upstream-name)

(defn normalize-keyword
  "Coerce strings/symbols/keywords into keywords and strip a leading ':' from strings."
  [k]
  (cond
    (keyword? k) k
    (symbol? k) (keyword (str k))
    (nil? k) nil
    :else (let [s (str k)
                s (if (.startsWith s ":") (subs s 1) s)]
            (keyword s))))

(defn key-string [k]
  (when-let [k (normalize-keyword k)]
    (if-let [ns (clojure.core/namespace k)]
      (str ns "/" (clojure.core/name k))
      (clojure.core/name k))))

(defn namespace-of [k]
  (some-> k normalize-keyword clojure.core/namespace))

(defn name-of [k]
  (if-let [k (normalize-keyword k)]
    (clojure.core/name k)
    ""))

(defn qualify [default-ns k]
  (let [k (normalize-keyword k)]
    (if (clojure.core/namespace k)
      k
      (keyword default-ns (name-of k)))))

(defn add-suffix [k suffix]
  (let [k (normalize-keyword k)]
    (if-let [ns (clojure.core/namespace k)]
      (keyword ns (str (name-of k) suffix))
      (keyword (str (name-of k) suffix)))))

(defn plain-map? [value]
  (and (map? value) (not (record? value))))
