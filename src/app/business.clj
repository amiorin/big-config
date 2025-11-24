(ns app.business
  (:require
   [big-config.store :refer [get-offset handle! store!]]
   [big-config.utils :refer [deep-merge]]))

(def initial-state
  {:theme "light"
   :debug false})

(defn my-business [state [op op-val] timestamp]
  (case op
    :run-job (let [{:keys [job-name owner]} op-val
                   job (get-in state [:jobs job-name])]
               (if (or (not job)
                       (= (:owner job) owner)
                       (= (:state job) :stopped))
                 (assoc-in state [:jobs job-name] {:owner owner
                                                   :state :running
                                                   :timestamp timestamp})
                 state))
    :stop-job (let [{:keys [job-name]} op-val
                    job (get-in state [:jobs job-name])]
                (if job
                  (assoc-in state [:jobs job-name :state] :stopped)
                  state))
    :merge (deep-merge state op-val)
    :reset initial-state))

(comment
  (def opts {:business-fn my-business
             :store-key "test4"
             :wcar-opts {:pool :none}})
  (def job-name "tofu")
  (def owner "Alberto")
  (def p1 (store! opts))
  (def p2 (store! opts))
  (-> @p1)
  (-> @p2)
  (get-offset p1)
  (get-offset p2)
  (handle! p1 [:merge initial-state])
  (handle! p1 [:run-job {:job-name job-name
                         :owner owner}])
  (handle! p2 [:run-job {:job-name job-name
                         :owner "foo"}])
  (handle! p2 [:stop-job {:job-name job-name}]))
