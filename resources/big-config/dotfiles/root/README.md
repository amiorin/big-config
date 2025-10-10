# Intro
Use big-config to manage your dotfiles.

https://www.big-config.it/use-cases/dotfiles/

``` shell
bb tasks
# The following tasks are available:
# 
# help    show detailed help
# render  render the dotfiles without installing them
# diff    render the dotfiles and diff them with the target
# install render the dotfiles and install them

bb help
# Usage: bb <cmd> -p|--profile <profile> -a|--all
# 
# The available commands are listed below.
# 
# Usage:
#   bb render -p macos
#   bb diff -p macos
#   bb install -p macos
# 
# profile:
#   When the profile option is missing, the DOTFILES_PROFILE env var is used
#   `default` is the profile used when a profile is not provided.
# 
# options:
#   -a is used by command render to render all profiles in `resources/stage-2`
#      folder
# 
# Commands
#   render          render the dotfiles without installing them
#   diff            render the dotfiles and diff them with the target
#   install         render the dotfiles and install them
```

## License

Copyright © 2025 Alberto Miorin

amiorin/dotfiles-v3 is released under the [MIT License](https://opensource.org/licenses/MIT).
