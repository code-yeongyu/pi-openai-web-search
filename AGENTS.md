# pi-openai-web-search

OpenAI native web search extension for the pi coding agent.

## Commands

- `bun install` - install dependencies (preferred for development)
- `npm install` / `npm ci` - install dependencies as an npm consumer
- `bun test` / `npm test` - run vitest tests
- `bun run typecheck` - run tsgo with strict TypeScript settings
- `bun run check` - run typecheck and Biome

## Conventions

- TypeScript is strict, ESM, and uses `.js` import suffixes.
- Keep extension behavior in `src/index.ts` unless the file grows enough to justify a focused helper module.
- Tests use vitest and fake only the ExtensionAPI methods exercised by this extension.
- Do not use `any`, `@ts-ignore`, `@ts-expect-error`, or non-essential type assertions.
