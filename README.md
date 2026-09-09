# GloPros onboarding

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000 → redirects to the first unfinished step
```

Any address registers and any file uploads. The failures have hardcoded triggers in the mocked
service, listed in [explanation/reproducing-errors.md](./explanation/reproducing-errors.md).

```bash
pnpm lint            # ESLint, zero warnings allowed
pnpm typecheck       # next typegen + tsc
pnpm test            # Jest + Testing Library
pnpm test:mutation   # Stryker over logic, validation, storage and the form infrastructure
pnpm build
```

## Written for the reviewer

| File                                                                     | What it answers                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [explanation/reasoning.md](./explanation/reasoning.md)                   | The trade-offs, the decisions behind them, the debt I would clear next.         |
| [explanation/ai-usage.md](./explanation/ai-usage.md)                     | The skills that produced the code, the gates that kept it reviewable, the docs. |
| [explanation/reproducing-errors.md](./explanation/reproducing-errors.md) | Every error state in the app and the input that triggers it.                    |

## Time spent

2 days.
