{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.babashka
    pkgs.bun
    pkgs.caddy
  ];
  languages.clojure.enable = true;
}
