(ns tofu
  (:require
   [big-spec :as bs]
   [cheshire.core :as json]
   [clojure.spec.alpha :as s]
   [module-a.main]))

(def env :prod)

(defn print-and-flush
  [res]
  (if (= env :prod)
    (do
      (println res)
      (flush))
    res))

(defn ^:export create-tf-json [args]
  {:pre [(s/valid? ::bs/config args)]}
  (let [{:keys [module]} args]
    (-> (symbol (str module ".main/invoke"))
        resolve
        (apply (vector args))
        (json/generate-string {:pretty true})
        print-and-flush)))

(comment
  (alter-var-root #'env (constantly :test))
  (create-tf-json {:aws-account-id "251213589273"
                   :region "eu-west-1"
                   :module "module-a"}))
