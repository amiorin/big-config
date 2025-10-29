# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

tidy:
    clojure-lsp clean-ns
    clojure-lsp format
