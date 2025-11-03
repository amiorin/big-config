{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.git
    pkgs.babashka
    pkgs.process-compose
    pkgs.just
    pkgs.redis
  ];
  languages.clojure.enable = true;
}
