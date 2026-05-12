# pi-openai-web-search

[![ci](https://github.com/code-yeongyu/pi-openai-web-search/actions/workflows/ci.yml/badge.svg)](https://github.com/code-yeongyu/pi-openai-web-search/actions/workflows/ci.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

OpenAI native web search extension for the [pi coding agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent).

This package is the standalone extraction of senpi's former builtin `openai-web-search` extension.

## Behavior

The extension does not register a new local tool. It intercepts OpenAI Responses-family requests and ensures native web search is available by injecting `{ type: "web_search" }` when absent.

| Case | Result |
|------|--------|
| API is `openai-responses` or `azure-openai-responses` and no native web search tool exists | injects `{ type: "web_search" }` |
| Existing native `web_search` or `web_search_preview` tool exists | preserves it (no duplication) |
| Function variant named `web_search` is present | strips function variant and keeps native variant |
| Non-Responses API payload | leaves payload unchanged |

It also appends a system-prompt section for Responses sessions indicating native `web_search` availability.

## Installation

The package targets the [`pi`](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) coding agent. Pi loads extensions from `~/.pi/agent/extensions/`, project `.pi/extensions/`, or via the `--extension` / `-e` CLI flag.

```bash
# From npm (once published)
pi install npm:pi-openai-web-search

# From git
pi install git:github.com/code-yeongyu/pi-openai-web-search

# Manual placement
git clone https://github.com/code-yeongyu/pi-openai-web-search ~/.pi/agent/extensions/pi-openai-web-search
cd ~/.pi/agent/extensions/pi-openai-web-search && npm install

# Dev / one-shot test
pi -e /path/to/pi-openai-web-search/src/index.ts
```

After installation, restart pi or run `/reload` inside an interactive session.

## Development

```bash
npm install
npm test
npm run typecheck
npm run check
pi -e ./src/index.ts
```

The test suite uses vitest. TypeScript is strict, Node-only, and uses ESM imports with `.js` suffixes.

## Origin

Ported from `packages/coding-agent/src/core/extensions/builtin/openai-web-search/index.ts` in `code-yeongyu/senpi-mono`.

## License

[MIT](LICENSE).

## Related

- [senpi](https://github.com/code-yeongyu/senpi) — the fork/runtime these extensions are extracted from.
- [Ultraworkers Discord](https://discord.gg/PUwSMR9XNk) — community link from the senpi README.
- [Dori](https://sisyphuslabs.ai) — the product powered by senpi under the hood.
