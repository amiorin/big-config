(ns big-config.core
  (:require
   [big-config :as bc]))

(defn ok
  ([]
   {::bc/exit 0
    ::bc/err nil})
  ([opts]
   (merge opts {::bc/exit 0
                ::bc/err nil})))

(defn choice [{:keys [on-success
                      on-failure
                      opts]}]
  (let [exit (::bc/exit opts)]
    (if (= exit 0)
      [on-success opts]
      [on-failure opts])))

(defn compose [step-fns f]
  (reduce (fn [f-acc f-next]
            (partial f-next f-acc)) (fn [_ opts] (f opts)) step-fns))

(defn resolve-step-fns [step-fns]
  (-> (map (fn [f] (cond
                     (ifn? f) f
                     (string? f) (-> f symbol requiring-resolve)
                     :else (throw (ex-info "f is neither a string nor a fn" {:f f}))))
           step-fns)
      reverse))

(defn try-f [f step opts]
  (try (f step opts)
       (catch Exception e
         (merge opts
                (ex-data e)
                {::bc/err (ex-message e)
                 ::bc/exit 1
                 ::bc/stack-trace (apply str (interpose "\n" (map str (.getStackTrace e))))}))))

(defn resolve-next-fn [next-fn last-step]
  (if (nil? next-fn)
    (fn [_ next-step opts]
      (if next-step
        (choice {:on-success next-step
                 :on-failure last-step
                 :opts opts})
        [nil opts]))
    next-fn))

(defn ->workflow
  "Creates a workflow.

  Supported options in `wf-opts`:
   - `:first-step`: the qualified keyword of the first step in the workflow.
      Usually `::start`.
   - `:last-step`: the qualified keyword of the last step in the workflow. If
      not defined, it will be `::end` with the same namespace of `::start`.
   - `:step-fns`: an array of step functions to be invoked before and after
      every step for purposes like logging or tracing. Is is optional.
   - `:wire-fn`: a function taking 2 arguments (step and step-fns) to wire
      together steps, functions and next-steps.
   - `:next-fn`: a function to handle special flows in the workflow when the
      default next-step provided in the wire-fn is not enough. It is optional"
  {:arglists '([wf-opts])}
  [{:keys [first-step
           last-step
           step-fns
           wire-fn
           next-fn]}]
  (let [last-step (or last-step
                      (keyword (namespace first-step) "end"))]
    (fn workflow
      ([]
       [first-step last-step])
      ([opts]
       (workflow (or step-fns []) opts))
      ([step-fns opts]
       (when (nil? opts)
         (throw (IllegalArgumentException. "ops should never be nil")))
       (let [step-fns (resolve-step-fns step-fns)
             run-workflow (fn [step opts]
                            (let [[f next-step] (wire-fn step step-fns)
                                  f (compose step-fns f)
                                  {:keys [::bc/exit] :as opts} (try-f f step opts)
                                  _ (when (nil? opts)
                                      (throw (ex-info "opts must never be nil" {:step step})))
                                  _ (when-not (nat-int? exit)
                                      (throw (ex-info ":big-config/exit must be a natural number" opts)))
                                  next-fn (resolve-next-fn next-fn last-step)
                                  [next-step next-opts] (next-fn step next-step opts)]
                              (if next-step
                                (recur next-step next-opts)
                                next-opts)))]
         (if (map? opts)
           (run-workflow first-step opts)
           (loop [in opts
                  out []
                  exit 0]
             (let [opts (first in)
                   [opts new-exit] (if (= exit 0)
                                     (let [{:keys [::bc/exit] :as opts} (run-workflow first-step opts)]
                                       [opts exit])
                                     [opts exit])
                   xs (rest in)
                   new-out (conj out opts)]
               (if (seq xs)
                 (recur xs new-out new-exit)
                 new-out)))))))))

(comment
  (let [wf (->workflow {:first-step ::start
                        :step-fns ["big-config.step-fns/bling-step-fn"]
                        :wire-fn (fn [step _]
                                   (case step
                                     ::start [(fn [opts]
                                                (println "foo")
                                                (merge opts {::bc/exit 1
                                                             ::bc/err "Failure"})) ::end]
                                     ::end [identity]))})]
    [(wf {}) (wf [{} {}])]))

(defn ->step-fn [{:keys [before-f after-f]}]
  (cond
    (every? nil? [before-f after-f]) (throw (IllegalArgumentException. "At least one f needs to be provided"))
    (= [nil :same] [before-f after-f]) (throw (IllegalArgumentException. ":before-f must be a f with :after-f :same")))
  (fn [f step opts]
    (when before-f
      (before-f step opts))
    (let [opts (f step opts)
          after-f (case after-f
                    nil (fn [_ _])
                    :same before-f
                    after-f)]
      (after-f step opts)
      opts)))
