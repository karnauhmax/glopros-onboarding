# Reasoning

What I cut, what I would do next, and the decisions the code forced on me.

## 1. Trade-offs

**No "City, country" field.** Figma draws it under the name row. I did not build it.

- **Why.** The A.C. never mention it and `RegistrationRequest` has no field for it, so there is
  nowhere to send the value and no rule for what a valid one looks like. A text box would match the
  design and collect a string nobody reads. Done properly it is a place autocomplete with a data
  source behind it, not an input.
- **With more time.** The blocker is an answer, not hours. The field is on the questions list in
  `docs/design/figma-reference.md`, and I would ask the designer what it feeds before building
  anything.

**Desktop only.** Fixed Figma widths, form 574, name inputs 280, button 279 by 56. No breakpoints.

- **Why.** It was not a priority and I did not want to spend the time. The A.C. say nothing about
  small screens and the design has one frame per step, so the hours went into the flow instead.
- **With more time.** A real responsive pass. `theme.breakpoints` already sits in the theme, unused,
  which makes it the one piece of dead code I kept.

**No mask on the phone input.** The input accepts separators while typing and `normalizePhone` strips
them, so `6 12 34 56 78` and a pasted `+31 6 12345678` both arrive as `612345678`.

- **Why.** It was not a priority and I did not want to spend the time. A mask means a template per
  country plus caret handling on paste and delete, and the placeholder and the always-visible
  `+31 · 9 digits` hint already carry the format, both from the country config.
- **With more time.** A per-country mask built from that same config, so the template and the hint
  cannot disagree.

**No email on the Success screen**

- **Why.** There is no truthful source. Registration stores `{ userId }`, and the sign-up draft is
  not what was registered, so "go back, edit the email, come forward" would confirm an address the
  API never saw. A plausible wrong address on a confirmation screen is worse than no address.
- **With more time.** Widen `Registration` to `{ userId, email }` and write the email from the
  validated `RegistrationRequest` at the moment registration succeeds. One type change, one write.

**No errors on submit attempt**

- **Why.** Flow 3 wants the primary action disabled until the step's requirements are met. Taken
  literally that makes the attempt impossible, since the button stays disabled while the form is
  invalid and Enter submits nothing. Errors show on blur, then live. After a submit only the server
  produces errors.

**File format checked by extension, never by MIME.**

- **Why.** The same `.doc` reports `application/msword`, `application/octet-stream` or an empty
  string depending on the OS and the browser, and `accept` does not apply to a dropped file at all.
  An extension check behaves the same everywhere. A MIME test would also have lied, because the
  fixture hard-codes `application/pdf`.

**A reload flashes empty fields before the draft appears.** Step 2 does the same, one frame of an
empty box before a stored upload shows.

- **Why.** Storage reads happen in effects, never during render, because a `useState` initializer
  runs on the server where there is no storage and that is a hydration mismatch. The flash is what
  the rule costs.
- **With more time.** A skeleton until the first read lands. Figma has no loading frame for either
  screen and I did not want to invent that state on the last day.

**`libphonenumber-js/max`, 40 KB gzipped instead of 20.**

- **Why.** `/min` accepted `12345` as a Dutch number, which defeats A.C. 1.3.
- **With more time.** Custom metadata for NL, PL and UA, which gives real validation at the 20 KB
  size.

### Additions beyond the design

Three things are in the build that Figma does not draw.

An eye toggle on each password field, because nine characters with a required digit and both cases is
exactly the kind that gets mistyped. The `trailing` slot it needed in `CustomFormInput` is generic
and reusable.

A "Remove" link on the uploaded card. Without it a stored upload can never be undone and step 2 stays
complete forever, so its absence is a flow bug, not missing polish.

Hover states across the kit, derived tokens behind `@media (hover: hover)` so touch devices never
stick in a hover state.

## 2. Debt I would clear next

Not trade-offs. These are things I know are wrong or missing, roughly in the order I would take them.

**Make the phone hint's digit count per country.** `countries.ts` builds `+${dialCode} · 9 digits`
for all three. True for NL, PL and UA, wrong for a fourth country, which is likely to arrive on the
review call.

**Derive the upload hint and `accept` from the validation constants.** The formats and the 10 MB
limit live in three places and no test catches a divergence.

**An integration test across the three steps.** Each step has unit tests of its own modules and I
walked the flow in Chrome after every slice. Nothing automated walks sign up to CV upload to Success.

**Known smaller gaps.** Storage survives if a user leaves Success without clicking Finish. A step URL
you have not earned shows one frame before the guard bounces you, because the guard is an effect.
`tsconfig.json` keeps `strict: true` while the assignment says "not a strict mode"; I read that as
not required.

**Invest more time in integration and E2E testing.** Unit tests prove the pieces, not the flow a
user actually walks. With more time this is where the next hours would go.
