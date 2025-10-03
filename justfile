# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# test all
test:
    clojure -M:test

# format and clean-ns all
tidy:
    clojure-lsp clean-ns
    clojure-lsp format

# invoked by recipe test
[group('private')]
test-wf-exit:
    #!/usr/bin/env -S bb --config bb.edn
    (require '[babashka.classpath :refer [add-classpath get-classpath]]
             '[clojure.string :as str])
    (add-classpath (str (System/getProperty "user.dir") "/test/clj"))
    (require '[big-config.step-fns-test :refer [wf-exit]])
    (wf-exit)
