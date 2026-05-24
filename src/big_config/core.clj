(ns big-config.core
  (:require [big-config.keys :as k]
            [big-config.utils :as u])
  (:import [java.io PrintWriter StringWriter]))

(defn ok
  ([] (ok {}))
  ([opts]
   (assoc (or opts {}) k/exit 0 k/err nil)))

(defn choice [{:keys [on-success on-failure opts]}]
  (if (zero? (get opts k/exit))
    [on-success opts]
    [on-failure opts]))

(defn- arity-call [f & args]
  (try
    (apply f args)
    (catch clojure.lang.ArityException _
      (case (count args)
        2 (f (first args))
        1 (f)
        (throw _)))))

(defn- call-wire-fn [wire-fn step step-fns]
  (try
    (wire-fn step step-fns)
    (catch clojure.lang.ArityException _
      (wire-fn step))))

(defn- compose-step-fns [step-fns f]
  (let [base (fn [_step opts] (f opts))]
    (reduce (fn [acc next]
              (fn [step opts]
                (next acc step opts)))
            base
            step-fns)))

(defn- resolve-step-fns [step-fns]
  (->> (or step-fns [])
       (map u/->fn)
       reverse
       vec))

(defn- stack-trace-string [^Throwable t]
  (let [sw (StringWriter.)]
    (.printStackTrace t (PrintWriter. sw))
    (str sw)))

(defn- try-step [f step opts]
  (try
    (f step opts)
    (catch Throwable t
      (merge opts
             (ex-data t)
             {k/err (or (.getMessage t) (str t))
              k/exit 1
              k/stack-trace (stack-trace-string t)}))))

(defn- resolve-next-fn [next-fn last-step]
  (or next-fn
      (fn [_step next-step opts]
        (if next-step
          (choice {:on-success next-step :on-failure last-step :opts opts})
          [nil opts]))))

(defn- normalize-workflow-options [opts]
  {:first-step (or (:first-step opts) (:firstStep opts))
   :last-step (or (:last-step opts) (:lastStep opts))
   :wire-fn (or (:wire-fn opts) (:wireFn opts))
   :next-fn (or (:next-fn opts) (:nextFn opts))})

(defn create-workflow [options]
  (let [{:keys [first-step wire-fn next-fn]} (normalize-workflow-options options)
        _ (when-not first-step (throw (IllegalArgumentException. ":first-step is required")))
        _ (when-not wire-fn (throw (IllegalArgumentException. ":wire-fn is required")))
        first-step (k/normalize-keyword first-step)
        last-step (k/normalize-keyword (or (:last-step (normalize-workflow-options options))
                                           (if-let [ns (k/namespace-of first-step)]
                                             (keyword ns "end")
                                             :end)))
        next-fn' (resolve-next-fn next-fn last-step)]
    (fn workflow
      ([] [first-step last-step])
      ([step-fns opts]
       (when (nil? opts)
         (throw (IllegalArgumentException. "opts should never be nil")))
       (let [resolved (resolve-step-fns step-fns)]
         (loop [step first-step
                current opts]
           (if-not step
             current
             (let [[impl next-step-from-wire] (call-wire-fn wire-fn step resolved)
                   impl (or impl identity)
                   wrapped (compose-step-fns resolved impl)
                   next-opts (try-step wrapped step current)
                   _ (when (nil? next-opts)
                       (throw (ex-info "opts must never be nil" {:step step})))
                   exit-code (get next-opts k/exit)
                   _ (when-not (and (integer? exit-code) (not (neg? exit-code)))
                       (throw (ex-info ":big-config/exit must be a natural number" next-opts)))
                   [next-step next-current] (next-fn' step next-step-from-wire next-opts)]
               (recur (some-> next-step k/normalize-keyword) next-current)))))))))

(def ->workflow create-workflow)

(defn create-step-fn [{:keys [before-f after-f beforeF afterF]}]
  (let [before-f (or before-f beforeF)
        after-f0 (or after-f afterF)]
    (when-not (or before-f after-f0)
      (throw (IllegalArgumentException. "At least one f needs to be provided")))
    (when (and (not before-f) (#{:same "same" ":same"} after-f0))
      (throw (IllegalArgumentException. ":before-f must be a f with :after-f :same")))
    (fn [f step opts]
      (when before-f (before-f step opts))
      (let [next-opts (f step opts)
            after-f (cond
                      (nil? after-f0) nil
                      (#{:same "same" ":same"} after-f0) before-f
                      :else after-f0)]
        (when after-f (after-f step next-opts))
        next-opts))))

(def ->step-fn create-step-fn)

(u/register-function 'big-config.core/ok ok)
