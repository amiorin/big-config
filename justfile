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

# upgrade all dependencies in the templates
upgrade:
    neil dep upgrade
    cd resources/big-config/ansible/root   && neil dep upgrade
    cd resources/big-config/dotfiles/root  && neil dep upgrade
    cd resources/big-config/multi/root     && neil dep upgrade
    cd resources/big-config/terraform/root && neil dep upgrade

# invoked by recipe test
[group('private')]
test-wf-exit:
    #!/usr/bin/env -S bb --config bb.edn
    (require '[babashka.classpath :refer [add-classpath get-classpath]]
             '[clojure.string :as str])
    (add-classpath (str (System/getProperty "user.dir") "/test/clj"))
    (require '[big-config.step-fns-test :refer [wf-exit]])
    (wf-exit)
