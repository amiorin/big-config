(ns big-config.rules
  (:require
   [big-config.git :refer [fetch-origin git-diff]]
   [odoyle.rules :as o]))

(defn ->step [fun-name fun next-step]
  (let [step-name (keyword fun-name)
        step-rule (keyword "big-config.rules" fun-name)]
    (o/->rule
     step-rule
     {:what (list ['id ::step step-name]
                  ['id ::next 'next]
                  ['id ::opts 'opts])
      :then (fn [_ {:keys [opts next]}]
              (let [{:keys [exit] :as next-opts} (apply fun [opts])]
                (deliver next {:next-step (if (= exit 0)
                                            next-step
                                            :end)
                               :next-opts next-opts})))})))

(defn ->rules [end-fn]
  (o/ruleset
   {::all-steps
    [:what
     [::derived ::all-steps all-steps]]

    ::step
    [:what
     [id ::step step]
     [id ::opts opts]
     :then-finally
     (->> (o/query-all session ::step)
          (o/insert session ::derived ::all-steps)
          o/reset!)]

    ::start
    [:what
     [id ::step :start]
     [id ::next next]
     [id ::opts opts]
     :then
     (deliver next {:next-step :git-diff
                    :next-opts opts})]

    ::end
    [:what
     [id ::step :end]
     [id ::next next]
     [id ::opts opts]
     :then
     (deliver next {:next-opts (end-fn opts)})]}))

(def counter (atom 0))

(defn run-step!
  [step next opts session]
  (let [id (swap! counter inc)
        next-session  (-> session
                          (o/insert id ::step step)
                          (o/insert id ::next next)
                          (o/insert id ::opts opts)
                          o/fire-rules)
        _ (when-not (realized? next)
            (throw (ex-info "Unrealized promised" {:step step})))
        {:keys [next-step next-opts new-session]} @next]
    (if (= step :end)
      {:opts next-opts
       :facts (o/query-all next-session)}
      (recur next-step (promise) next-opts (or new-session next-session)))))

(comment
  (let [end-fn identity
        step-fn (fn [_])]
    (loop [step :start
           next (promise)
           opts {}
           session (as-> (o/->session) $
                     (reduce o/add-rule $ (->rules end-fn))
                     (o/add-rule $ (->step "git-diff" git-diff :fetch-origin))
                     (o/add-rule $ (->step "fetch-origin" fetch-origin :end)))]
      (step-fn step)
      (run-step! step next opts session))))
