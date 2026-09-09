---
name: add-feature
description: Adds a feature module under src/features/ — its layer tree, barrels, ESLint isolation entry, routes and tests. Use when the work introduces a domain area of its own: a second flow, a module with its own API contract or storage, anything that is not part of the onboarding feature. For a screen inside an existing feature use add-screen; for a field in an existing form use add-form-field.
---

# Add a feature

A feature is a module in `src/features/<feature>/`. From outside only `@/features/<feature>` is
importable; the rest is internal.

Read `docs/architecture.md` (Tree, Layer mapping, Rules) first. This file is the order of
operations, not a replacement for it.

## Is it a feature?

| The work is                                 | Where it goes                                                   |
| ------------------------------------------- | --------------------------------------------------------------- |
| Own domain, own API contract or own storage | a feature — this file                                           |
| A step or page inside the onboarding flow   | `add-screen`                                                    |
| A control with no domain knowledge          | `src/shared/ui` (architecture.md, "How to add a kit component") |

Two features never import each other. Anything both need moves to `@/shared/*` and loses its domain
knowledge on the way.

## Checklist

1. **`eslint.config.mjs` first**: add the name to `FEATURES`. It is the only file outside the
   feature that must change, and skipping it fails silently — the module compiles with no isolation
   rules and no `ui → api` ban.
2. **Tree.** Every folder gets an `index.ts`; sub-folder barrels are the only importable paths.
   ```
   src/features/<feature>/
     index.ts              # public API: screens, layout, entry hooks
     shared/               # feature core: ui/ model/ storage/, each with index.ts
     api/                  # index.ts, types.ts, <feature>-service.ts
     <step>/               # index.ts + ui/ (+ model/ (+ validation/))
   ```
   Create `model/`, `validation/` and `storage/` only when there is something to put in them.
   Empty folders are not created.
3. **Directions.** `ui → model → validation | api`. Only `storage/` touches `sessionStorage`. A file
   under `ui/**` importing `@/features/<feature>/api` is a lint error; the call goes through the
   step's `model`.
4. **`'use client'`** on files under `ui/` only. Hook modules and pure modules carry no directive.
5. **Props under `ui/` are `interface`s.** `type` stays for unions and for the contract in
   `api/types.ts`.
6. **Routes.** `src/app/<…>/page.tsx` imports the screen from `@/features/<feature>` and renders it,
   nothing else. A feature never imports `@/app/**`.
7. **Tests** in `__tests__/` next to each module. Stryker's glob is
   `src/features/**/{model,validation,storage}/**`, so the new feature's logic is mutated the day it
   lands — no config change, and no exemption to ask for.
8. **Update `docs/architecture.md`**: the tree, and any rule the change touches. Docs are the source
   of truth (`AGENTS.md`).
9. `pnpm lint && pnpm typecheck && pnpm test && pnpm test:mutation` — all four green.

## Traps

- **Deep import.** `@/shared/ui/Button` and `@/features/<feature>/ui/Thing` are lint errors. Only
  `@/shared/<layer>`, `@/features/<feature>` and — inside the feature —
  `@/features/<feature>/<folder>` resolve. `styles/` is the exception: imported by file, no barrel.
- **Barrel cycle.** `import/no-cycle` follows imports that bind a name, so a cycle made purely of
  side-effect imports is invisible. Keep `shared/form` from importing `shared/ui`.
- **A kit component added on the way** needs an explicit export from `shared/ui/index.ts` and a
  section in `app/showcase/page.tsx`.
