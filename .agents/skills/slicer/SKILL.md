---
name: slicer
description: Cuts a finished planning artifact — a deep-interview spec, a ralplan plan, a GitHub issue, or any written-down task — into vertical, decomposed slices, each with a mandatory "Done when" acceptance criterion and explicit dependencies, written to a stateless slices file in .plans/slices/. Never reads the codebase, never interviews, and stops after writing the file. Use when a planned task needs cutting into small deliverable portions, when state-plan needs a slices file, or when the user says "slicer", "slice this", "cut into slices".
---

<Purpose>
Slicer takes one finished artifact and cuts it into vertical, decomposed slices. Vertical: each slice runs end-to-end through the task — a thin path through everything the outcome touches — rather than one layer or category across the whole. Decomposed: small enough for one focused session; for code, one pull request. Every slice carries a description, an observable "Done when" acceptance criterion, and explicit dependencies.

It is a pure text transformation: artifact in, slices file out. It never reads the codebase, never modifies its input, and never implements. Statuses and check commands are deliberately absent from the output — they belong to `state-plan`, which consumes this file.
</Purpose>

<Use_When>
- A finished artifact exists — a `deep-interview` spec, a `ralplan` plan, a GitHub issue, or any written task description with real substance — and the task is bigger than one session
- A ralplan plan's implementation steps need recutting into deliverable portions — the plan says how to build; the slices say in what portions to deliver
- `state-plan` invoked it to produce the slices file it needs
- User says "slicer", "slice this", "cut into slices", "break this into slices"
</Use_When>

<Do_Not_Use_When>
- No artifact exists, or the input is a bare sentence — refuse and name `deep-interview` as the remedy; slicer never interviews
- The task already fits one session — a one-slice file is not worth writing
- The user wants statuses, checks, or a working journal — that is `state-plan`
- The user wants the task executed — slicer produces an artifact and stops
</Do_Not_Use_When>

## Configuration

| Setting         | Default                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Artifact root   | `.plans/`                                                                                        |
| Slices file     | `.plans/slices/{slug}.md`                                                                        |
| Slug            | inherited from the source artifact (`deep-interview-auth.md` → `auth`); else kebab-case from the task title |
| Output language | follows the source artifact                                                                      |

## 🛑 Hard Constraints

1. **Never explore beyond the input.** Not one repository file — not to "check a path", not to "confirm a name". Slicing transforms the input artifact's text and nothing else; concrete specifics are the business of the artifact's author or the slice's executor. Fetching the input itself (a GitHub issue via `gh issue view`) is reading the input, not exploring.
2. **Strict input gate.** No artifact, or one too thin to slice honestly → refuse, recommend `deep-interview`, stop. Slicer asks no requirements questions of its own.
3. **Stateless output.** No statuses and no check commands in the slices file. Both are `state-plan`'s layer.
4. **The source stays authoritative.** Slicer never edits its input. A ralplan plan keeps its Task Breakdown untouched — the slices file is a second cut of the same work, not a replacement.
5. **Artifact out, then stop.** No implementation, no GitHub issues created, no `state-plan` invocation, no delegation.

## Steps

### 1. Resolve the input

- An explicit path, issue URL/number, or pasted text from the user or a calling skill wins.
- Otherwise glob `.plans/plans/ralplan-*.md` and `.plans/specs/*.md` for an artifact matching the named task. Prefer the ralplan plan when both exist — it is the later refinement.
- A GitHub issue is fetched with `gh issue view` (title and body only).

**The gate.** The input passes when honest "Done when" lines can be derived from its text alone. If acceptance criteria would have to be invented rather than derived, the input is too thin: refuse, name `deep-interview`, stop.

### 2. Cut

- **Vertical.** Each slice is a thin end-to-end path through the task. For a software feature that means through every layer it touches — schema, endpoint, screen, tests. For anything else it means through every aspect that must line up before the piece is genuinely done.
- **Horizontal spreading is the failure mode**: one layer or category at a time across the whole task — all schemas, then all endpoints; all research, then all writing. The test is soft — a slice need not prove "the system can now do something new" — but it must not be a category pass.
- **Decomposed.** Size every slice to one focused session; for code, one pull request. Anything larger splits. Scaffolding and groundwork decompose like everything else: small verifiable pieces, each with an AC, no special status.
- Every slice carries: a description (what it delivers, a few sentences from the source's text), a **Done when** line (an observable truth condition), and explicit dependencies (earlier slices by number, or `none`).
- Derive "Done when" from the source's own acceptance criteria wherever they exist; tighten to observable form where they are loose.

### 3. Self-check

Before writing the file, verify in the same pass — fix and re-check whatever fails:

- [ ] Every slice has a "Done when" that is observable and derived from the source, not invented
- [ ] Every slice fits one focused session
- [ ] Dependencies are explicit on every slice — `none` is spelled out
- [ ] No slice is a horizontal category pass
- [ ] No statuses, no check commands anywhere in the file
- [ ] The source artifact was not modified

A reviewer subagent is a deliberate non-feature of this version; the self-check is the whole gate.

### 4. Write and stop

Write `.plans/slices/{slug}.md`, report the path and the slice count, and stop. `state-plan` is the natural next step — name it, do not invoke it.

## Slices File Format

```markdown
# Slices: {title}

- Source: {path or URL} — authoritative on scope
- Generated: {date}

## 1. {slice name}

{What this slice delivers.}

**Done when** {observable condition}.

Depends on: none

## 2. {slice name}

{...}

**Done when** {...}.

Depends on: 1
```

<Examples>
<Good>
Vertical cut of "password login" (spec → 3 slices):
1. Session token + password hashing, with unit tests — no route yet.
2. Login route + session middleware, integration-tested.
3. Login screen wired into the route table.
Each slice ships alone; each has an observable "Done when"; 2 depends on 1, 3 on 2.
</Good>
<Good>
Vertical cut of a non-code task, "prepare a conference talk":
1. A five-minute end-to-end draft of the whole talk, spoken aloud once.
2. The full-length version of the strongest section, with its slides.
3. The remaining sections brought to the same state.
Each slice is a runnable whole, not a category; "all research, then all slides, then all rehearsal" would be the horizontal cut.
</Good>
<Bad>
Horizontal cut of "password login":
1. All schemas and types. 2. All endpoints. 3. All screens.
Why bad: no slice delivers anything; each is a category pass across the whole task — exactly what the soft test rejects.
</Bad>
<Bad>
Slice with a check instead of an AC:
"**Done when** `pnpm test` passes."
Why bad: a command is a check, and checks are `state-plan`'s layer. Derive an observable condition from the source instead: "a tampered cookie is rejected by a test that proves it".
</Bad>
</Examples>

<Final_Checklist>
- [ ] Input was a finished artifact; thin input was refused with `deep-interview` named
- [ ] Nothing beyond the input was read — no repository files
- [ ] Every slice: description, "Done when", explicit dependencies
- [ ] Every slice vertical, sized to one session; no horizontal category passes
- [ ] Output is stateless — no statuses, no check commands
- [ ] Self-check ran before the file was written
- [ ] Source artifact unmodified
- [ ] File at `.plans/slices/{slug}.md`, path and slice count reported, then stopped
</Final_Checklist>
