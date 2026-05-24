{ pkgs, ... }:

{
  packages = [
    pkgs.git
    pkgs.python312
    pkgs.uv
  ];
}
