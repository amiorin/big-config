# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# test all
test: test-big-infra test-big-config

# format and clean-ns all
tidy:
    clojure-lsp clean-ns
    cd big-infra && clojure-lsp clean-ns
    clojure-lsp format
    cd big-infra && clojure-lsp format

# test big-config
[group('clojure')]
test-big-config:
    clojure -M:test

# test big-infra
[group('tofu')]
test-big-infra:
    cd big-infra-v2 && clojure -M:test

# invoked by recipe test
[group('private')]
test-wf-exit:
    #!/usr/bin/env -S bb --config big-infra-v2/bb.edn
    (require '[babashka.classpath :refer [add-classpath get-classpath]]
             '[clojure.string :as str])
    (add-classpath (str (System/getProperty "user.dir") "/test/clj"))
    (require '[big-config.step-fns-test :refer [wf-exit]])
    (wf-exit)
