{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.git
    pkgs.clojure
    pkgs.direnv
  ];
}
