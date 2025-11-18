# list of all recipes
help:
    @just -f {{ justfile() }} --list --unsorted

# format and clean-ns all
tidy:
    clojure-lsp clean-ns
    clojure-lsp format

build:
    clojure -T:build uber

# install new jar
install:
    sudo cp target/app.jar /home/app/app.jar
    sudo chown app:app /home/app/app.jar
