# Architecture

Modular architecture. `app/` holds thin routes, `shared/` a generic kit and utilities with no domain
knowledge, `features/onboarding/` a single module built from vertical step folders plus a
feature-level `shared/` core. Inside a step the assignment's split lives as layers: `ui/`, `model/`,
`validation/`, plus the module-level `api/` and `storage/`.

## Tree

```
src/
  app/                                 # Next routes; only compose screens from @/features/onboarding
    layout.tsx                         # exists: fonts + styled-components registry + theme provider
    page.tsx                           # entry route: client, sends the user to the first unfinished step
    onboarding/
      layout.tsx                       # shared step layout (ProgressHeader, guard) taken from the feature
      sign-up/page.tsx
      cv-upload/page.tsx
      success/page.tsx
  features/
    onboarding/                        # MODULE. From outside visible only as @/features/onboarding
      index.ts                         # public API: screens, layout, useFlowEntry
      shared/                          # core shared by the steps (not src/shared)
        index.ts
        ui/       index.ts             # step chrome: layout, progress header, back link, StepContent,
                                       # FileName, shared copy
        model/    index.ts             # Logic layer
          steps.ts                     # the step registry: order, completion, neighbours
          messages.ts                  # copy produced by logic (the generic error message)
          hooks/  index.ts             # useCurrentStep, useFlowEntry, useStepGuard
        storage/  index.ts             # the only module that touches sessionStorage
      api/                             # API layer
        index.ts                       # public: OnboardingService, onboardingService, MOCK_TRIGGERS, contract types
        types.ts                       # contract types from the assignment + OnboardingService
        onboarding-service.ts          # mocked service: latency, deterministic error triggers
        __tests__/                     # the service test and its request fixtures
      sign-up/
        index.ts
        ui/  model/  validation/       # each has index.ts; validation = zod schemas (Validations)
      cv-upload/
        index.ts
        ui/  model/  validation/
      success/
        index.ts
        ui/  model/                    # no form, so no validation/; empty folders are not created
  shared/                              # project-wide, no domain knowledge
    ui/    index.ts                    # Button, SubmitButton, CustomFormInput, CustomFormFileInput,
                                       # Checkbox, Select, FormError, ProgressBar, Spinner, Link
      icons/ index.ts                  # CheckIcon, ChevronDownIcon, RequirementCheckIcon, EyeIcon, EyeOffIcon
    form/  index.ts                    # CustomForm, form context (useOptionalFormField, useOptionalFormContext)
    lib/   index.ts                    # generic helpers (composeRefs, composeHandlers)
  styles/                              # theme, fonts, global styles, registry, provider; the mixins
                                       # text-style, link-style, visually-hidden
  test-utils/ index.ts                 # renderWithTheme, createRouterMock, createDeferred
    fixtures/ index.ts                 # builders shared by several modules
```

There are two `shared` folders: `@/shared/*` is project-wide and domain-free,
`@/features/onboarding/shared` is the feature core and may know about onboarding.

Files in `shared/ui` are flat, exactly as the assignment names them —
`shared/ui/CustomFormInput.tsx`, `shared/ui/CustomFormFileInput.tsx`, `shared/ui/SubmitButton.tsx`,
`shared/form/CustomForm.tsx`. The one exception is `shared/ui/icons/`: one component per icon,
re-exported through the kit barrel. Styled parts live inside the component file. Tests live in
`__tests__/` next to the module they cover.

A file is named after what it exports. A component file is PascalCase (`CustomFormInput.tsx`,
`SignUpForm.tsx`), a hook file is camelCase after the hook (`useRegistration.ts`, `useStepGuard.ts`),
everything else is kebab-case (`onboarding-service.ts`, `sign-up-schema.ts`). `app/` follows Next's
own file conventions (`page.tsx`, `layout.tsx`).

## Layer mapping

| Assignment term | Folder(s)                                                              | What lives there                                              | What must not live there                      |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------- |
| UI Components   | `shared/ui`, `shared/form`, `features/onboarding/*/ui`                 | Presentation, styled parts, form wiring                       | Validation schemas, API calls, storage access |
| Logic           | `features/onboarding/<step>/model`, `features/onboarding/shared/model` | Hooks, step registry, guard, submit orchestration             | JSX, zod schemas, direct `sessionStorage`     |
| Validations     | `features/onboarding/<step>/validation`                                | Zod schemas and inferred types for that step                  | React, API calls                              |
| API layer       | `features/onboarding/api`                                              | `OnboardingService` interface, mocked service, contract types | Domain screens, React state                   |
| Storage         | `features/onboarding/shared/storage`                                   | The single module calling `sessionStorage`                    | Anything else calling `sessionStorage`        |
| Styling tokens  | `src/styles`                                                           | Theme, fonts, global styles, registry, provider               | Feature or route imports                      |

## Rules

### Enforced by ESLint

`eslint.config.mjs`: `no-restricted-imports` per zone plus `import/no-cycle`. Zones are `src/**`
(baseline), `src/shared/**` + `src/styles/**`, and two blocks per entry of the `FEATURES` array
(today `['onboarding']`): the feature itself and its `*/ui/**` folders.

1. **Module isolation.** `shared/` and `styles/` never import `@/features/**` or `@/app/**`; a
   feature never imports another feature (`@/features/*` except its own).
2. **Public API through barrels.** Every module and sub-folder has an `index.ts`. Forbidden
   patterns: `@/shared/*/**` everywhere, `@/features/*/**` outside a feature,
   `@/features/<feature>/*/**` inside it — so only `@/shared/<layer>`, `@/features/<feature>` and,
   inside the feature, `@/features/<feature>/<folder>` are importable. `styles/` is the exception: a
   token folder imported by file (`@/styles/theme`, `@/styles/text-style`, `@/styles/link-style`,
   `@/styles/visually-hidden`), no barrel.
3. **Routes are the top.** A feature never imports `@/app/**`; `app/` composes features, not the
   other way round.
4. **UI never calls the API directly.** Files under `features/<feature>/*/ui/**` cannot import
   `@/features/<feature>/api`; the call goes through the step's `model`.
5. `import/no-cycle: error` — the safety net for barrel-to-barrel cycles. Known limit: the rule
   follows only imports that bind a name; a cycle made purely of side-effect imports
   (`import './x'`) is not detected.
6. **Props are interfaces.** `@typescript-eslint/consistent-type-definitions` requires that object
   types under `ui/` folders and `shared/form` are `interface`s (props, option shapes); `type` stays
   for unions (`ButtonProps['size']`) and for the API contract in
   `features/onboarding/api/types.ts` and `styles/theme.ts`, which the rule does not cover. An
   empty `interface XProps extends YProps {}` is the way to derive a prop set
   (`no-empty-object-type` allows a single `extends`).

```ts
// shared/ui/Button.tsx
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {} // ok
export type ButtonProps = { … } & ButtonHTMLAttributes<HTMLButtonElement>; // error — props are an interface

// app/onboarding/sign-up/page.tsx
import { SignUpScreen } from '@/features/onboarding'; // ok
import { SignUpScreen } from '@/features/onboarding/sign-up'; // error — outside a feature: root barrel only

// features/onboarding/sign-up/ui/SignUpForm.tsx
import { onboardingStorage } from '@/features/onboarding/shared'; // ok
import { steps } from '@/features/onboarding/shared/model/steps'; // error — sub-folder barrel only
import { CustomForm } from '@/shared/form'; // ok
import { CustomForm } from '@/shared/form/CustomForm'; // error — shared layer barrel only
import { onboardingService } from '@/features/onboarding/api'; // error — ui never calls the API
import Page from '@/app/onboarding/sign-up/page'; // error — features never import routes
import { signUpSchema } from '../validation'; // ok — relative, inside the module
```

Relative imports are not linted: `../model` inside a module is normal, crossing a module boundary
with `../../` is forbidden by convention only. Adding a feature costs one entry in `FEATURES`.

### Conventions (not linted)

- Inside a step the dependency order is `ui → model → validation | api`. The `ui → api` edge is
  linted (rule 4); the rest is convention.
- `shared/model` keeps the pure step registry (`steps.ts`) apart from the React hooks (`hooks/`), so
  the registry stays testable without a renderer. A step's own `model/` is one or two hooks and
  stays flat.
- `app/` pages stay thin: import the screen from the module root and render it. `app/page.tsx` is
  the one exception; it has no screen of its own and only calls `useFlowEntry` to pick the step.
- `/onboarding` itself has no page: `next.config.ts` redirects it to `/`, so only the entry route
  knows where the flow starts.
- `'use client'` goes on every file that calls a React hook or renders a styled component: all of
  `ui/`, `shared/ui`, `shared/form`, `styles/*.tsx` and every hook module in `model/`. Pure modules
  (the step registry, storage, validation, copy) carry no directive. The hooks need it even though
  only client components call them: `app/onboarding/layout.tsx` is a Server Component that imports
  the feature barrel, and Turbopack follows that barrel into the hooks.
- A screen that reads or writes storage does it through a hook in its `model/`, even when the step
  has no form (`success/model/useCompletion`). The UI layer only renders what the hook returns.

```tsx
// features/onboarding/sign-up/ui/SignUpForm.tsx
import { useRegistration } from '../model'; // ok — ui -> model
window.sessionStorage.setItem('sign-up', draft); // avoid — only shared/storage touches storage

// features/onboarding/sign-up/model/useRegistration.ts
import { onboardingService } from '@/features/onboarding/api'; // ok — model -> api
import { onboardingStorage } from '@/features/onboarding/shared'; // ok — model -> storage via the core

// shared/ui/CustomFormInput.tsx
import { useOptionalFormField } from '@/shared/form'; // ok — the one allowed direction
// shared/form/CustomForm.tsx
import { SubmitButton } from '@/shared/ui'; // avoid — form never imports ui (barrel cycle)

// app/onboarding/sign-up/page.tsx
export default function Page() {
  return <SignUpScreen />; // ok — thin page; form state, API calls, storage belong to the screen
}
```

## How to add a step

1. Create `features/onboarding/<step>/{index.ts, ui/…}` and add `model/` and `validation/` if the
   step has logic or a form.
2. Export the screen from `features/onboarding/index.ts` — that is the module's only public surface.
3. Add `app/onboarding/<step>/page.tsx` importing the screen from `'@/features/onboarding'` and
   rendering it.
4. Register the step in `features/onboarding/shared/model`: the step registry drives the progress
   bar, the guard and the navigation, so nothing else needs to change.

A new field in an existing form is a change inside that step only: its schema in `validation/` and
a kit control with the matching `name` in `ui/`. Inside a `CustomForm`, `name` binds
`CustomFormInput`, `CustomFormFileInput` and `Checkbox` to the form and shows their error. `Select`
is the exception: it is controlled (`value` / `onChange`) because it renders the selected option
itself, so a form wires it with `useController`, as `PhoneField` does.

## How to add a kit component

1. One file `shared/ui/<Name>.tsx` with `'use client'`; the styled parts live in it.
2. `interface <Name>Props extends <NativeAttributes>`, spreading `...rest` before every attribute
   the kit owns (`type`, `role`, `aria-*`), so a caller cannot clobber them. A control bound to a
   form composes the caller's `onChange` / `onBlur` with the form's instead of letting one win.
3. The wrapper element receives `className` and `style`, never the inner control; ids come from
   `useId` with an `id` prop as override.
4. Theme tokens only — no literal colour, radius or font size.
5. Export it explicitly from `shared/ui/index.ts`.
6. Test only the component's own logic: id and label wiring, aria attributes, derived state.

## How to add an icon

1. One file `shared/ui/icons/<Name>Icon.tsx` rendering `SvgIcon` with the `viewBox`, `naturalSize`
   and `strokeWidth` taken from Figma.
2. Its `<path>` children draw on `currentColor` — no hard-coded fill or stroke.
3. Export it from `icons/index.ts` and again, explicitly, from `shared/ui/index.ts`.
4. Callers import it from `@/shared/ui`; the deep path `@/shared/ui/icons` is a lint error (rule 2).
