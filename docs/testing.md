# Testing

Jest 30 through `next/jest` on jsdom, Testing Library for anything that renders, Stryker for
mutation testing. `pnpm test` runs the suite, `pnpm test:mutation` runs the mutants.

## What we test

A unit is one module in isolation; whatever it talks to across a boundary is substituted.

| Kind                | Example                                                                | Boundary mocked                               |
| ------------------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| Pure function       | `signUpSchema` rejects a phone number invalid for the selected country | none — explicit input, explicit output        |
| Hook (`renderHook`) | `useRegistration` keeps the form locked while the request is in flight | `OnboardingService` through `jest.fn()`       |
| Storage module      | `onboardingStorage` never writes the password into a draft             | jsdom `sessionStorage`, cleared between tests |
| Component or screen | `SignUpForm` disables submit until the form is valid                   | API interface, storage module, router         |

**Not written.** Integration tests (several screens or routes together, real `sessionStorage` and
the mock API driven across steps) are the next addition; every step is covered by unit tests of its
own modules. E2E is out of scope: no deployed environment, no browser runner. Snapshots are never
written: they pin markup, not behaviour.

## Principles

- **Behaviour, not implementation.** Assert what a caller or a user observes: a returned value,
  rendered text, a disabled button, a call to a mocked boundary. Never internal state.
- **Only the component's own logic.** A component test covers what the component decides: id and
  label wiring, aria attributes, defaults, derived state, conditional rendering. It never proves
  that a native attribute (`disabled`, `href`, `checked`, `ref`) reached the element, or that the
  browser toggles, submits or navigates — React and jsdom already guarantee that.
- **Arrange / Act / Assert**, separated by blank lines; the blank lines replace `// Arrange`
  section comments.
- **Names read as sentences**: `it('disables the button while the form is invalid')`, never
  `it('works')`.
- **One behaviour per test.** Several assertions about one behaviour are fine, a second behaviour
  is a second test.
- **No logic in tests.** No `if`, no loop that hides which input failed, no expectation computed by
  the code under test.
- **Explicit values.** `'Password1'` beats a builder hiding why the value is valid; helpers absorb
  setup noise, never the input under test.

## Component tests

Query priority, first that fits wins:

| Order | Query                                              | Use for                                                             |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------- |
| 1     | `getByRole('button', { name: /create account/i })` | anything with a role: buttons, fields, checkboxes, headings         |
| 2     | `getByLabelText(/email/i)`                         | form fields whose accessible name comes from a label                |
| 3     | `getByText(/must include a number/i)`              | text with no role: hints, errors, static copy                       |
| last  | `getByTestId`                                      | only when no query above can name the element; fix the markup first |

- Render through `renderWithTheme` from `src/test-utils`: a bare `render` has no theme provider,
  so styled-components fails on the first token lookup.
- Interact through `@testing-library/user-event` (`user.type`, `user.click`, `user.tab`), not
  `fireEvent`: it replays focus and blur, which is what validation reacts to.
- **One exception to that rule: drag events.** `user-event` has no drag API at all, so
  `dragEnter`, `dragOver`, `dragLeave` and `drop` are dispatched with `fireEvent` and a literal
  `dataTransfer`. Those four event names are the whole exception; every other interaction,
  including the click that opens the file dialog, still goes through `user-event`
  (`user.upload(input, file)`).
- Wait with `findBy*` or `waitFor`. Never a `setTimeout`, never fake timers used as a sleep. Fake
  timers are fine when time itself is the behaviour under test (the mock service's latency).
- Hold a mocked boundary in flight with `createDeferred` from `src/test-utils` and resolve it inside
  the Act phase or in a cleanup, never after the assertions.
- Never assert class names, styled props, DOM nesting or internal state. State whose only effect is
  a styled prop (the drag highlight of `CustomFormFileInput`) therefore has no test.

## Examples

The examples below show the target shape; the real modules carry the current copy.

```ts
// src/features/onboarding/sign-up/validation/__tests__/password.test.ts
import { passwordSchema } from '../password';

describe('passwordSchema', () => {
  it('rejects a password without an upper case letter', () => {
    const password = 'lowercase1';

    const result = passwordSchema.safeParse(password);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      'Letters (uppercase & lowercase)',
    );
  });

  it('accepts nine characters with a number and both cases', () => {
    const password = 'Password1';

    const result = passwordSchema.safeParse(password);

    expect(result.success).toBe(true);
  });
});
```

```tsx
// src/features/onboarding/sign-up/ui/__tests__/SignUpForm.test.tsx
import userEvent from '@testing-library/user-event';

import { renderWithTheme, screen } from '@/test-utils';

import { SignUpForm } from '../SignUpForm';

describe('SignUpForm', () => {
  it('disables the submit button while the form is invalid', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');

    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
  });

  it('enables the submit button once the form is valid', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
    // first name, last name and phone are typed the same way
    await user.type(screen.getByLabelText(/^password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('checkbox', { name: /terms/i }));

    expect(await screen.findByRole('button', { name: /create account/i })).toBeEnabled();
  });
});
```

`SignUpForm` composes `CustomForm` from `@/shared/form` with the inputs and `SubmitButton` from
`@/shared/ui`, and takes its form from the `useRegistration` hook; the test knows none of that:
rewire the internals and it still passes.

## Fixtures

- Reused inside one file or folder: `__tests__/fixtures.ts` next to the tests.
- Reused by several layers of one step or module: `<step>/__tests__/fixtures.ts`
  (`sign-up/__tests__/fixtures.ts` serves the step's `model/` and `validation/` tests). A builder
  that needs a feature type stays inside the feature, because the import rules bind tests too.
- Reused by several modules and free of feature types: `src/test-utils/fixtures/<name>.ts`,
  exported through that folder (`createCvFileFixture`).
- Fixtures are plain data or builders returning plain data (`export const validSignUp = { … }`):
  no `render`, no `expect`, no mock wiring.

## Files and imports

- `__tests__/<Name>.test.ts(x)` next to the module it covers; `.tsx` only when it renders JSX.
- Import the unit under test the way production code would: the public barrel from outside
  (`@/features/onboarding`, `@/shared/form`), a relative path inside the module (`../password`).
- The import rules in `docs/architecture.md` apply to tests too — ESLint runs over `src/**`,
  `__tests__` included, so reaching into another module's internals is the same error here. A
  screen test under `ui/` therefore reaches the API module it mocks by a relative path, with a
  comment saying why.
- `jest.mock` takes the same path as the import (`jest.mock('@/features/onboarding/api')`);
  `jest.config.ts` maps the `@/` alias for Jest itself, which is also what lets Stryker find every
  test that loads a module.

## Mutation testing (mandatory)

`pnpm test:mutation` runs Stryker and must pass before a pull request is opened. Coverage says the
line ran, the mutation score says a test would have noticed the line change.

| Setting     | Value                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| Mutated     | features `model/`, `validation/`, `storage/`; `shared/form`, `lib`     |
| Not mutated | UI components, routes, styles, barrels, `__tests__`, the mocked `api/` |
| Thresholds  | high 80, low 60, break 60 — below 60 the command exits non-zero        |
| Report      | `reports/mutation/index.html`                                          |
| Reruns      | incremental, so an unchanged file is not mutated again                 |

UI stays out: mutating styled markup produces mutants no assertion should care about.
`stryker.config.mjs` holds the exact globs. A surviving mutant is a missing assertion — read its
diff in the report and add the assertion that kills it. Never lower a threshold, never exclude the
file; both hide the gap instead of closing it.

One class of survivor is accepted without an assertion: the dependency array of a `useEffect` or
`useCallback` (`[form]` → `[]`, `[]` → `['Stryker was here']`). React runs the hook the same way for
both arrays in every scenario a test can set up, so the mutant is equivalent. A line no input can
reach (a fallback that only satisfies a type, a CSS reset) is marked in place with
`// Stryker disable next-line <Mutator>: reason`, and the reason is the explanation. Everything
else must die.

## Checklist before a PR

- [ ] Every new module inside the mutated scope has tests next to it.
- [ ] Test names read as sentences and assert behaviour, not markup or internals.
- [ ] No snapshot, no timer used as a sleep, no `fireEvent` outside the four drag events;
      `data-testid` only as a last resort.
- [ ] Repeated values live in a fixture, in the folder matching their reach.
- [ ] `pnpm test` green.
- [ ] `pnpm test:mutation` green, no surviving mutant outside the dependency-array class above.
