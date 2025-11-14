# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# format and clean-ns all
tidy:
    clojure-lsp clean-ns
    clojure-lsp format
