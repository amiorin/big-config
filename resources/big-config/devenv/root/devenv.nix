{ pkgs, lib, config, inputs, ... }:

{
  packages = [ pkgs.git pkgs.babashka ];
  languages.clojure.enable = true;
}
