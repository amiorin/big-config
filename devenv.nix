{ pkgs, lib, config, inputs, ... }:

{
  packages = [
    pkgs.git
    pkgs.nodejs
    pkgs.direnv
  ];
}
