(ns big-config.core
  (:require
   [big-config :as bc]))

(defn ok [opts]
  (merge opts {::bc/exit 0
               ::bc/err nil}))

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
                     (fn? f) f
                     (string? f) (-> f symbol requiring-resolve)
                     :else (throw (ex-info "f is neither a string nor a fn" {:f f}))))
           step-fns)
      reverse))

(defn try-f [f step opts]
  (try (f step opts)
       (catch Exception e
         (-> (if-let [ex-opts (ex-data e)]
               ex-opts
               opts)
             (merge {::bc/err (ex-message e)
                     ::bc/exit 1
                     ::bc/stack-trace (apply str (interpose "\n" (map str (.getStackTrace e))))})))))

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
       (let [step-fns (resolve-step-fns step-fns)]
         (loop [step first-step
                opts opts]
           (let [[f next-step] (wire-fn step step-fns)
                 f (compose step-fns f)
                 {:keys [::bc/exit] :as opts} (try-f f step opts)
                 _ (when (nil? opts)
                     (throw (ex-info "ops must never be nil" {:step step})))
                 _ (when-not (nat-int? exit)
                     (throw (ex-info ":big-config/exit must be a natural number" opts)))
                 next-fn (resolve-next-fn next-fn last-step)
                 [next-step next-opts] (next-fn step next-step opts)]
             (if next-step
               (recur next-step next-opts)
               next-opts))))))))

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

(comment
  (let [wf (->workflow {:first-step ::start
                        :step-fns ["big-config.step-fns/bling-step-fn"]
                        :wire-fn (fn [step _]
                                   (case step
                                     ::start [(fn [opts]
                                                (println "foo")
                                                (ok opts)) ::end]
                                     ::end [identity]))})]
    (wf {})))
