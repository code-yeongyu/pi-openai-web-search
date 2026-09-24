# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-09-24

### Changed

- Migrated peer and dev dependencies from `@mariozechner/pi-*` to `@earendil-works/pi-ai` and `@earendil-works/pi-coding-agent` at 0.87.1.
- Toolchain pins: `@biomejs/biome` 2.5.14, `vitest` 5.0.1, `@types/node` 26.6.2, `@typescript/native-preview` 7.0.0-dev.20260707.2 (`typescript` remains 7.0.2).
- `engines.node` is now `>=22.19.0`.
- Added Bun 1.4.2 CI (`ubuntu-latest`/`macos-latest` × Node 22/24) plus an `npm ci` consumer job. There was no workflow before this release.
- Native injection now uses `{ type: "web_search_preview" }` and treats GA `{ type: "web_search" }` as unsupported on Responses payloads, matching senpi.

### Fixed

- Strip OpenAI native `web_search_preview` tools (and source `include` / `tool_choice`) from non-Responses payloads so they cannot leak to Anthropic or Chat Completions backends.
- Gate native web search injection by endpoint: `api.openai.com`, Azure Responses, or `compat.supportsWebSearchPreview`.
- Sanitize Anthropic native `web_search_*` / `web_fetch_*` tools out of OpenAI Responses payloads.

### Added

- `bun.lock` alongside `package-lock.json` so Bun CI and npm consumers both have a frozen install path.

## [0.1.0] - 2026-05-07

### Added

- Initial pi coding-agent extension that mirrors senpi builtin `openai-web-search` and injects OpenAI native web search tools for Responses APIs.
