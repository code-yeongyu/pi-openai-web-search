# Contributing to pi-openai-web-search

Keep changes small, targeted, and tested.

Before opening a PR:

```bash
npm install
npm run check
npm test
npm pack --dry-run
```

If behavior changes, update `README.md`, `CHANGELOG.md`, and tests.

Tests follow `#given X #when Y #then Z` naming with `// given / // when / // then` body comments.

Do not use `any`, `@ts-ignore`, or `@ts-expect-error`. Validate and narrow unknown data at boundaries.
