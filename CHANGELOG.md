# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The patch number is calculated with `git rev-list --count HEAD`

## [Unreleased]

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
