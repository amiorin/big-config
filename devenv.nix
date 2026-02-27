{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.git
    pkgs.babashka
    pkgs.process-compose
    pkgs.just
    pkgs.redis
    pkgs.clj-kondo
  ];
  languages.clojure.enable = true;
}
