---
name: add-form-field
description: Adds, removes or renames a field in a form that already exists — the zod rule, the default, the control, the stored draft, the API contract, server-side errors, and the fixtures and tests that assume the old field set. Use when a form gains or loses an input, or a validation rule changes. For a whole new screen use add-screen; for a new domain module use add-feature.
---

# Add a form field

A field is a change inside one step: its rule in `validation/`, a control with the matching `name`
in `ui/`. Everything else — draft, API contract, server errors — is opt-in, one decision per point
below.

Read `docs/architecture.md` — the paragraph on a new field at the end of "How to add a step" —
and `docs/testing.md`.

## Checklist

1. **Schema** in `<step>/validation/`:
   - the field on the form-values type (`SignUpFormValues`);
   - an entry in the empty defaults (`emptySignUpValues`) — a field missing there makes React warn
     about an uncontrolled input becoming controlled;
   - the rule and its message inside the `z.object`.
2. **API contract**, if the value is sent. `signUpSchema` is typed
   `z.ZodType<RegistrationRequest, SignUpFormValues>`, so anything that reaches the request must
   exist on `RegistrationRequest` in `api/types.ts`, and anything that must not reach it
   (`confirmPassword`) is dropped in the closing `.transform`. Both directions are type errors if
   you get them wrong — let `pnpm typecheck` tell you.
3. **Draft**, if the value must survive a reload: `draftSchema` in `shared/storage/schemas.ts`, then
   `toDraft()` in the step's model hook. Nothing secret goes in — the password is left out on
   purpose.
4. **Control** in `<step>/ui/`, inside the `CustomForm`:
   - `CustomFormInput`, `CustomFormFileInput` and `Checkbox` bind themselves by `name` and render
     their own error;
   - `Select` is controlled, because it renders the selected option itself — wire it with
     `useController`, copying `PhoneField`;
   - a field that is really two inputs (country plus number) gets its own component in `ui/`.
5. **Cross-field rules** go in `.superRefine` with `path: ['<field>']`, so the message lands on the
   field and not on the form. A field whose validity depends on another also needs an entry in
   `REVALIDATE_ON_CHANGE` in the model hook, or it keeps a stale error after the other one changes.
6. **Server-side error**, if the API can reject the field: the `fieldErrors` union in
   `api/types.ts`, then `FIELD_PATHS` and `SERVER_FIELDS` in the model hook. Only the first is
   checked for you — `FIELD_PATHS satisfies Record<ServerField, …>` fails to compile with a key
   missing, while `SERVER_FIELDS satisfies readonly ServerField[]` only checks the entries that are
   there. Forget the array and the field's server error is never shown, with nothing to warn you.
   Check it by hand.
7. **Fix what assumes the old field set.** A new required field breaks every "valid form" path
   quietly:
   - `sign-up/__tests__/fixtures.ts` → `createSignUpFormValuesFixture`;
   - `sign-up/ui/__tests__/SignUpForm.test.tsx` → `fillValidForm`.
8. **New tests**: the rule in `validation/__tests__/` with explicit input and explicit output — this
   is the code Stryker mutates — plus one behaviour test in the form if the field changes what the
   user sees. Query by label or role; `getByTestId` is the last resort.
9. `pnpm lint && pnpm typecheck && pnpm test && pnpm test:mutation`.

## Traps

- **The label is the API.** It is the accessible name, the test query and the copy. Rename it and
  every test that names it changes with it.
- **Testing the platform.** That `disabled` or `checked` reached the DOM is React's job, not a test.
  Assert what the user observes: the message, the enabled button, the call to a mocked boundary.
- **A surviving mutant on the new message** means no test named it. Add the assertion; never lower a
  threshold and never exclude the file.
- **Validation in the UI.** Rules live in `validation/`, orchestration in `model/`. A regex in the
  component is the wrong layer even when it is one line.
