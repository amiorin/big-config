# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The patch number is calculated with `git rev-list --count HEAD`

## [Unreleased]

### Changed

- rename `show-help` to `help`
- -tidy -smoke-test -test and -test:bb are now private tasks

## [0.3.264] - 2025-10-09

### Added

- `selmer` whitespace control implemented as workaround (`{{-` `-}}`) (see https://github.com/yogthos/Selmer/issues/115#issuecomment-3383327391)

### Changed

- `dotfiles` template
  - creation of `.envrc.private` is now dynamic based on the profile
  - add `/dist` to `.gitignore` 
  - `default` profile is instead of `null` if no profile is provided

## [0.3.256] - 2025-10-06

### Added

- New website: https://www.big-config.it
- `big-config` has integrated and extended `deps-edn`: https://www.big-config.it/guides/build/
  - `render` is the new name of the step and it should be used intead of `build` that was invoking `deps-new`
  - `selmer` as templating language
  - `src` is interpolated like `target`
  - `src` can be a symbol or a function to generate files with code
- Clojure Tools is used to generate `big-config` templates: https://www.big-config.it/guides/clojure-tools/
  - action: Create a GitHub action for the CI of a Clojure project.
  - ansible: Create a repo to manage Ansible projects with BigConfig.
  - devenv: Create the devenv files for Clojure and Babashka development.
  - dotfiles: Create a repo to manage dotfiles with BigConfig.
  - generic: Create a repo to manage a generic projects with BigConfig.
  - multi: Create a repo to manage both Ansible and Terraform projects with BigConfig.
  - terraform: Create a repo to manage Terraform/Tofu projects with BigConfig.
  - tools: Create a tools.clj for a Clojure project.
- Template `dotfiles` is inspired by https://www.chezmoi.io/
- Many blog articles:
  - https://www.big-config.it/blog/a-new-approach-to-dotfiles-management-with-bigconfig/
  - https://www.big-config.it/blog/why-ansible-still-rules-for-your-dev-environment/
  - https://www.big-config.it/blog/reimplementing-aws-eks-with-big-config/
  - https://www.big-config.it/blog/killer-feature-big-config/
  - https://www.big-config.it/blog/big-config-replaces-atlantis/
- Looking for a logo. My skills are not good enough.

## [0.2.187] - 2025-07-30

### Added

- `deps-new` is now a pillar of `big-config` developer experience and it enables the support for any `devops` tool (`tofu`, `ansible`, `helm`, `gh-actions`, ...).
- `step` workflow to enable users to express `workflow` in the cli.
- `build-fn` to provide a hook for running `deps-new` in the `step` workflow
- `step/parse` to parse the DSL workflows in the cli.
- `dist` as default `target-dir` for `deps-new`
- `module` and `profile` as convention for multiple outputs and multiple environments
- `port-assigner` to assign always the same port based on the path of the project
- `secrets-manager` to retrieve credentials from AWS

### Changed
- `deps-new` in now creating a `deps-new + big-config`.

## [0.1.169] - 2025-04-18

### Added

- Template with `deps-new` for creating a new project from scratch.
- `big-config.edn` is now a resource for portability. 
- `Construct` defrecord for `tofu` blocks.
- `To` protocol for `tofu` blocks.
- Stdlib for tofu `big-tofu.create` for common `Construct`.
- `stack-trace` in a temp file.
- Reusable tests `stability` and `catch-nils` for `tofu`.
- `#module` tag for module discovery in testing.
- Guardrail for `prod`. All destructive action in `prod` are stopped.

### Changed
- Use `bb` tasks instead of `just` recipes.
