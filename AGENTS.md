# pi-openai-web-search

OpenAI native web search extension for the pi coding agent.

## Commands

- `npm install` - install dependencies
- `npm test` - run vitest tests
- `npm run typecheck` - run tsgo with strict TypeScript settings
- `npm run check` - run typecheck and Biome

## Conventions

- TypeScript is strict, ESM, and uses `.js` import suffixes.
- Keep extension behavior in `src/index.ts` unless the file grows enough to justify a focused helper module.
- Tests use vitest and fake only the ExtensionAPI methods exercised by this extension.
- Do not use `any`, `@ts-ignore`, `@ts-expect-error`, or non-essential type assertions.
