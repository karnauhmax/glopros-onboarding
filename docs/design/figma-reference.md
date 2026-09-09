# Figma reference — Onboarding flow

Source: Figma file "Upload step in Onboarding flow" (frames: `Step 1. Create an account` 8:220, `Step 2. Upload CV` 1:110, `Step 3. Uploaded CV` 1:144, `Step 3. Error` 13:410). Extracted with Figma MCP (`get_variable_defs`, `get_design_context`) on 2026-09-07. Assets exported to `public/`; the monochrome icons `check`, `chevron-down` and `requirement-check` were later moved into `src/shared/ui/icons/` as components (inline SVG with `currentColor`), so `public/icons/` keeps only the flags and the upload icons; the logo is `public/logo.svg`.

## Tokens

### Colors

| Figma variable                                                   | Value                              | Used for                                         |
| ---------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| `background/default/bg-default`, `background/primary/bg-primary` | `#ffffff`                          | page, inputs, cards                              |
| `background/secondary/bg-secondary`                              | `#f1f5f9`                          | progress bar track                               |
| `border/default/border-default`                                  | `#cad5e2`                          | inputs, cards, progress track                    |
| `border/alerts/border-error`, `text/alerts/text-error`           | `#e7000b`                          | error border + error text                        |
| `text/base/text-primary`                                         | `#18233a`                          | labels, input text                               |
| `text/secondary/text-secondary`                                  | `#676e81`                          | hints, terms text, chevron                       |
| `Primary Color_1` (heading)                                      | `#021b38`                          | page titles                                      |
| `Secondary Text_Color_1` (subtitle)                              | `#6e6f7d`                          | page subtitles, helper line under drop zone      |
| `Primary Text_Color`                                             | `#0d102b`                          | file name in success card                        |
| drag & drop label                                                | `#0f0f0f`                          | "Drag & drop CV or"                              |
| `text/brand/text-brand`, `button/primary/primary-bg`             | `#052d69`                          | primary button, checkbox, logo, icons            |
| `text/base/text-primary-inverse`                                 | `#f5f8fa`                          | button label                                     |
| `button/link/primary`                                            | `#1751a7`                          | text links ("Replace", terms links)              |
| `icon/alerts/icon-success`                                       | `#00a63e`                          | password requirement met (icon + text)           |
| warning icon                                                     | `#d08700`                          | upload error icon                                |
| progress fill gradient                                           | `#aed0f9 → #216ad5` (left → right) | progress bar fill (image fill in Figma, sampled) |
| `opacity/50`                                                     | `0.5`                              | disabled primary button                          |

### Typography

Families: heading `Montserrat` (600), body / CTA `Roboto` (400, 500, 700). Both on Google Fonts.

| Style                       | Family     | Weight | Size / line-height | Letter-spacing | Used for                                   |
| --------------------------- | ---------- | ------ | ------------------ | -------------- | ------------------------------------------ |
| `heading/H4 semibold`       | Montserrat | 600    | 28 / 1.35          | 2% (0.56px)    | page title                                 |
| `heading/H6 medium`         | Montserrat | 600    | 18 / 1.45          | 2% (0.36px)    | file name in card                          |
| `body/body L normal`        | Roboto     | 400    | 18 / 28            | 0              | page subtitle                              |
| `body/body M normal (base)` | Roboto     | 400    | 16 / 24            | 0              | input text, card description               |
| `body/body S normal`        | Roboto     | 400    | 14 / 20            | 0              | field labels                               |
| `Body_1`                    | Roboto     | 500    | 16 / 24            | 0.5px          | "Drag & drop CV or"                        |
| `Body_2`                    | Roboto     | 400    | 16 / 24            | 0.5px          | helper line under drop zone                |
| `Body_4`                    | Roboto     | 400    | 14 / 16            | 0.5px          | "PDF, DOC or DOCX up to 10 MB", terms text |
| `Caption`                   | Roboto     | 400    | 12 / 12            | 0              | password requirements                      |
| `Link`                      | Roboto     | 500    | 16 / 18            | 0.5px          | "Replace" link                             |
| `button/button M bold`      | Roboto     | 700    | 16 / 24            | 5% (0.8px)     | buttons                                    |

### Spacing, radii, sizes

- Spacing scale (`spacing/*`): 2, 4, 8, 10, 12, 16, 20, 24, 40, 56.
- Radii: `sm` 4 (checkbox), `lg` 8 (inputs), 10 (drop zone / card), `button-radius` 9999 (pill).
- Navbar: height 98, white; logo 149×32 at x=111, y=26.
- Progress bar: height 13, top 87 (overlaps navbar bottom), full width; track `#f1f5f9` + 1px `#cad5e2` border; fill width per step: 1/3, 2/3, 3/3 (Figma shows 480 / 960 / 1420 of 1440).
- Content block: vertically centered; header (title, subtitle) centred, gap 12; header → form gap 24.
- Form: width 574; field gap 16; first/last name 280 each with gap 14; label → input gap 6.
- Input: height 40, padding 10px 14px, radius 8, 1px `#cad5e2`, white; text 16/24.
- Phone input: add-on on the left (flag 24×16.32 + chevron 20, padding 14/12 — read as 14 left / 12 right with no vertical padding, the only reading that fits a 20px chevron in the 40px box; `Select` implements it that way), then text input with its own border and right radii.
- Password requirements row: 6px under the input (container has 19px bottom padding), items gap 12, icon 16 + 6 gap, text 12/12 green when met.
- Fields block → checkbox gap 24; checkbox 16, radius 4, filled `#052d69` with white 12px check; label gap 8; terms text 14/16 `#676e81` with links.
- Checkbox → primary button gap 60; primary button 279×56, pill, padding 10px 24px, centred under the form.
- Drop zone: 574×264, radius 10, padding 35px 64px, gap 8; upload icon 47×60; "Upload CV" button height 40, padding 8px 20px, pill; hint 14/16.
- Success / error card: same box, content column gap 24: icon 50, file name (H6), description 16/24, "Replace" link.
- Below drop zone: helper line, then Continue button (gap 32–35 / 60).

## Screens

### Step 1 — Create account (8:220)

Title "Create your GloPros account", subtitle "One profile for freelance, permanent, and payroll roles across Europe.". Fields in design order: First name | Last name, City, country, Phone number (country add-on), Email, Set password (+ requirements row: `9+ characters`, `Number`, `Letters (uppercase & lowercase)`), Confirm password, terms checkbox, button "Create account". Progress 1/3.

### Step 2 — Upload CV, empty (1:110)

Title "Welcome to GloPros!", subtitle "Pick one source and we'll build your profile for you.". Drop zone: icon, "Drag & drop CV or", button "Upload CV", hint "PDF, DOC or DOCX up to 10 MB". Below: "You can replace your CV any time from your profile.", button "Continue" disabled (opacity .5). Progress 2/3.

### Step 2 — uploaded (1:144) and error (13:410)

Same page; card shows check icon + file name + "We'll read your CV to prefill your profile." + "Replace" link (Continue enabled), or warning icon + file name + red "Something went wrong. Please try again." + "Replace" with red border (Continue disabled). Figma labels these frames "Step 3" and their progress is ~3/3.

## Deviations and open questions for the designer

1. **No dedicated Success screen** (account created + email + CV name + one action) exists in Figma; A.C. requires it. Build it from the same primitives: title/subtitle, card with success icon, summary lines, primary button.
2. **"City, country" field** is in the design but not in the A.C. nor in the API contract. Not implemented.
3. **Terms links are white** in Figma (invisible on white). Use `button/link/primary` `#1751a7`.
4. **Field order**: A.C. lists email before phone; design has phone before email. Following the design order.
5. **No error / focus / disabled input states** in the file; no loading state for the button; no "uploading" state for the drop zone. Derive: error = `#e7000b` border + 14/20 red message under the input; focus = `#052d69` border; loading = spinner in the button, opacity .5; uploading = card with file name + spinner.
6. **Progress fill** is an image in Figma; implemented as a CSS linear-gradient `#aed0f9 → #216ad5`.
7. **Progress 3/3** is drawn as 1420/1440 in Figma; rendered as 100%.
8. **State precedence** is not specified. A focused field shows the brand focus border even while
   invalid: `:focus` comes after the error border in `CustomFormInput` and `Select`. The checkbox
   keeps its box colour and shows an outline ring instead, so a checked box stays visibly focused.
9. **6px gaps** (label → input, input → message) are literals: the Figma spacing scale has no 6.
10. **No hover states** are in Figma; derived rules: button background turns `primaryHover`
    (`primaryActive` on `:active`), links turn brand colour and keep the underline (`linkStyle` in
    `src/styles/link-style.ts`, shared by every text link and link-styled button), and
    input/select/checkbox borders turn `border.hover`. Hover never overrides focus, error, or
    disabled styling, and every hover rule is gated by `@media (hover: hover)` so touch devices
    don't get stuck hover states.
11. **Password visibility toggle** is not in Figma. Each password field gets its own eye button
    (`Show password` / `Hide password`) in the input's trailing slot; hidden by default.
12. **Phone format hint** is always visible under the number input as `+31 · 9 digits` (dial code
    and length of the selected country) and is replaced by the error text while the number is
    invalid. Figma has no hint line. The placeholder is an example national number.
13. **"Go back" link**: Figma has no back control, the A.C. require one. A text link `Go back`
    under the step content on every step after the first, leading to the previous step. The last
    step closes the flow and shows no back link.
14. **Desktop only.** Widths are the fixed Figma values (content column 574 as
    `theme.sizes.contentWidth`, inputs 280 / 40, button 279×56); no breakpoints.
15. **No note about the cleared password.** After a reload the password fields are empty and the
    form shows no explanation (a conscious cut of A.C. Persistence 2, recorded in the README).
16. **No "Remove" control** on the uploaded / error card in Figma, only "Replace". Without it a
    stored upload could never be undone, and the step would stay completed forever. The card gets a
    second link, "Remove", next to "Replace"; it clears the stored result and returns the empty box.
17. **No uploading state** for the drop zone. Derived from deviation 5: while the request is in
    flight the box shows the file name and a `Spinner`, and the box is disabled so neither a click
    nor a drop can start a second upload.
18. **Error copy comes from the service, not from Figma.** Figma draws "Something went wrong. Please
    try again."; the mocked service answers "Upload failed. Please try again.". The card renders
    `response.message` as it arrives — the screen never rewrites a server text. Client-side refusals
    (wrong extension, empty file, over 10 MB) use the three fixed messages in `CV_FILE_MESSAGES`,
    which Figma does not draw either.
19. **The error card's icon is a warning triangle, not a cross.** A.C. 2.6 asks for a cross icon;
    the exported asset `upload-error.svg` is an exclamation triangle in `#d08700`, and Figma's error
    frame uses it. Following the asset rather than the wording, so the design and the build agree;
    swapping it is one file.
20. **No email on the Success screen** although A.C. 3.1 asks for it. The stored `Registration`
    holds only `userId`, and the sign-up draft can disagree with what was actually registered, so
    there is no truthful source. The screen shows the confirmation and the CV file name only; the
    cost of adding it is recorded in the README.

## Mapping to the theme (`src/styles/theme.ts`)

| Figma                                                       | Theme key                                                          | Note                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| `background/default`, `background/primary`                  | `colors.background.default`                                        | merged, both `#ffffff`                                          |
| `background/secondary`                                      | `colors.background.secondary`                                      |                                                                 |
| `border/default`                                            | `colors.border.default`                                            |                                                                 |
| `border/alerts/border-error`, `text/alerts/text-error`      | `colors.border.error`, `colors.text.error`                         |                                                                 |
| `Primary Color_1`, `Primary Text_Color`                     | `colors.text.heading`                                              | `#0d102b` folded into `#021b38`                                 |
| `text/base/text-primary`, drag & drop label                 | `colors.text.primary`                                              | `#0f0f0f` folded into `#18233a`                                 |
| `text/secondary`                                            | `colors.text.secondary`                                            |                                                                 |
| `Secondary Text_Color_1`                                    | `colors.text.subtitle`                                             |                                                                 |
| `text/base/text-primary-inverse`                            | `colors.text.inverse`                                              |                                                                 |
| `button/link/primary`                                       | `colors.text.link`                                                 |                                                                 |
| `button/primary/primary-bg`, `text/brand`                   | `colors.button.primaryBg`, `colors.brand`                          |                                                                 |
| `icon/alerts/icon-success`                                  | `colors.icon.success`                                              | the warning colour lives inside the exported `upload-error.svg` |
| (none)                                                      | `colors.border.focus`                                              | derived: brand color                                            |
| (none)                                                      | `colors.button.primaryHover` / `primaryActive`                     | derived: brand lightened / darkened                             |
| (none)                                                      | `colors.border.hover`                                              | derived: `border.default` one step darker                       |
| (none)                                                      | `transitions.fast`                                                 | derived                                                         |
| `heading/H4`, `heading/H6`                                  | `typography.h4`, `typography.h6`                                   |                                                                 |
| `body L / M / S`                                            | `typography.bodyL / bodyM / bodyS`                                 | `Body_2` (16/24, 0.5px) folded into `bodyM`                     |
| `Body_1`                                                    | `typography.bodyMMedium`                                           |                                                                 |
| `Body_4`                                                    | `typography.helper`                                                |                                                                 |
| `Caption`, `Link`, `button M bold`                          | `typography.caption`, `typography.link`, `typography.button`       |                                                                 |
| `spacing/*`                                                 | `spacing[1 … 14]`                                                  | same numeric keys as Figma; the 2px step is unused and absent   |
| `radius primitives/sm`, `lg`, drop zone 10, `button-radius` | `radii.sm`, `radii.lg`, `radii.xl`, `radii.pill`                   |                                                                 |
| navbar / progress bar / content column sizes                | `sizes.navbarHeight`, `sizes.progressHeight`, `sizes.contentWidth` | input, button, drop zone sizes stay in their components         |
| progress fill image                                         | `gradients.progress`                                               | sampled from the PNG                                            |
| `opacity/50`                                                | `opacity.disabled`                                                 |                                                                 |

Fonts are loaded with `next/font/google` (`src/styles/fonts.ts`) and exposed as `--font-montserrat` / `--font-roboto`; `theme.fonts` references those variables with local fallbacks. Text styles are applied with `textStyle('h4')` from `src/styles/text-style.ts`.
