---
name: add-screen
description: Adds a screen to the onboarding flow — the step folder, the route, the entry in the step registry, the storage slot that marks it complete, and the existing tests the new step breaks. Use when adding a step, screen or page to the flow, or a route under app/ that is not a step. For a whole new domain module use add-feature; for a field in a form that already exists use add-form-field.
---

# Add a screen

A screen in the flow is a step folder, a route, and one entry in the step registry. The registry
drives the progress bar, the guard and the back link, so registering the step is what makes it real.

Read `docs/architecture.md` ("How to add a step") and, for the visuals,
`docs/design/figma-reference.md`.

## Checklist

1. **Storage first, if the step can complete.** A step is complete when the snapshot says so, so the
   state has to exist before the registry can read it: `shared/storage/schemas.ts` (zod schema plus
   inferred type), `onboarding-storage.ts` (read / save / clear and a field on
   `OnboardingSnapshot`), then both barrels.
2. **Register the step** in `shared/model/steps.ts`:
   - add the id to the `StepId` union;
   - add a `Step` const with `path: '/onboarding/<step>'` and `isCompleted(snapshot)`;
   - insert it into `steps` in flow order — list order is flow order.

   The last step never completes (`isCompleted: () => false`); `getFirstUnfinishedStep` depends on
   that and its fallback is marked unreachable for Stryker.

3. **Step folder** `src/features/onboarding/<step>/`:
   - `ui/<Name>Screen.tsx` with `'use client'`, built from `StepContent` and `StepHeading` plus the
     kit;
   - `model/` whenever the screen reads or writes storage or calls the API, even with no form —
     `success/model/useCompletion` is the precedent;
   - `validation/` only when there is a form or a file rule;
   - an `index.ts` in each folder, and `<step>/index.ts` re-exporting the screen from `./ui`.
4. **Export** the screen from `src/features/onboarding/index.ts` — the module's only public surface.
5. **Route** `src/app/onboarding/<step>/page.tsx`: import the screen from `'@/features/onboarding'`
   and render it. Nothing else — `app/onboarding/layout.tsx` already applies the chrome and the
   guard.
6. **Fix the tests the new step breaks.** They assert the old flow and will fail on arrival:
   - `shared/model/hooks/__tests__/useCurrentStep.test.ts` asserts `total` is `3`;
   - `shared/model/__tests__/steps.test.ts` covers order, neighbours and completion;
   - the `useFlowEntry` and `useStepGuard` tests navigate the real registry.
7. **Write the step's own tests** (`docs/testing.md`): the hook through `renderHook` with its
   boundaries mocked, the screen through `renderWithTheme` queried by role and label.
8. `pnpm lint && pnpm typecheck && pnpm test && pnpm test:mutation`.

## A route that is not a step

The `/showcase` shape: an `app/` route with no registry entry. `useStepGuard` ignores it —
`getStepByPath` returns `undefined`, so no redirect — and the progress bar never counts it. Keep it
outside `app/onboarding/` unless it should wear the flow chrome.

## Traps

- **Reading storage during render.** Storage exists only in the browser. Read it in an effect or an
  event handler, through a hook in `model/`; the UI renders what the hook returns.
- **A literal path in the screen.** Navigate through the registry (`getNextStep('<step>')?.path`) so
  inserting a step later moves the flow for free.
- **`/onboarding` has no page of its own**: `next.config.ts` redirects it to `/`, and `app/page.tsx`
  picks the step with `useFlowEntry`.
- New `model/`, `validation/` and `storage/` code is mutated by Stryker as soon as it lands.
