# GloPros onboarding — agent guide

## Read first

| Working on…                  | Read                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| anything                     | `task-description.md` (temporary line: the assignment; removed before submission), then `docs/product.md` |
| project structure, new files | `docs/architecture.md`                                                                                    |
| UI, styles, design tokens    | `docs/design/figma-reference.md`                                                                          |
| tests                        | `docs/testing.md`                                                                                         |
| Next.js APIs                 | `node_modules/next/dist/docs/` (block below)                                                              |

## Always

- Before you finish: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:mutation` — all green.
- Docs are the source of truth. If you change a rule, update the doc in the same change.
- Package manager is pnpm only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
