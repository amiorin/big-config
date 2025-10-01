# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# render README.md
readme:
    cd .big-config && bb readme

# test all
test: test-big-config

# format and clean-ns all
tidy:
    clojure-lsp clean-ns
    clojure-lsp format
    cd big-infra-v2 && clojure-lsp clean-ns
    cd big-infra-v2 && clojure-lsp format

# test big-config
[group('clojure')]
test-big-config:
    clojure -M:test

# invoked by recipe test
[group('private')]
test-wf-exit:
    #!/usr/bin/env -S bb --config bb.edn
    (require '[babashka.classpath :refer [add-classpath get-classpath]]
             '[clojure.string :as str])
    (add-classpath (str (System/getProperty "user.dir") "/test/clj"))
    (require '[big-config.step-fns-test :refer [wf-exit]])
    (wf-exit)
