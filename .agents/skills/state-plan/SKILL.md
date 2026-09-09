---
name: state-plan
description: Turns a slices file into the working journal of a task — a state plan with a usage protocol, append-only dated Decisions, parts carrying status, "Done when", a deterministic Check and a verbatim Last run, and open questions. Reads the project to derive check commands; invoked without a slices file it runs slicer first. The journal belongs to the task, not a branch, and is archived when the task closes. Use when sliced work is about to span multiple sessions, when progress must survive session boundaries, or when the user says "state-plan", "state plan", "working journal", "task journal".
---

<Purpose>
State-plan turns a slices file into the task's working journal — the one file a fresh session reads to continue the work without losing nuance. It exists to solve three problems: memory that survives sessions, a deterministic "done" (the AC → Check → Last run chain displaces subjective judgment), and open questions that stay visible instead of dissolving into context. The journal belongs to the task, not to a branch: it survives branches and pull requests, and closes with the task. This skill generates the journal and stops — it never executes a part.
</Purpose>

<Use_When>
- A slices file exists and execution is about to span more than one session
- Invoked directly on a task or artifact with no slices file — it invokes `slicer` first
- Work keeps losing nuance between sessions and needs a journal with deterministic checks
- User says "state-plan", "working journal", "task journal", "turn the slices into a plan"
</Use_When>

<Do_Not_Use_When>
- The task fits one sitting — a journal would outweigh the work
- Requirements are still vague — `deep-interview` first; nothing here interviews
- Slicing is all that is needed — that is `slicer`
- The user wants the parts executed — this skill writes the journal and stops
</Do_Not_Use_When>

## Configuration

| Setting                    | Default                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| State plan                 | `.plans/state/{slug}.md`                                                    |
| Slices input               | `.plans/slices/{slug}.md`                                                   |
| Closed plans               | moved to `.plans/archive/`                                                  |
| Part statuses              | `todo / doing / done / blocked`                                             |
| Slug                       | inherited from the slices file and its source chain                         |
| Versioning `.plans/state/` | each project's documented choice — versioned, or gitignored                 |

## 🛑 Hard Constraints

1. **Journal of the task, not the branch.** It survives branches and pull requests and closes when the task is done — closing moves it to `.plans/archive/`, where its decision history stays available as accumulated knowledge. Rules like "this file does not merge" are a project's choice, not part of the template.
2. **The source stays authoritative.** An existing artifact — issue, spec, plan — is linked and digested, never copied. Inline the task body only when the task arrived as bare text with no artifact behind it.
3. **The generator writes Check; the executor writes Last run.** Two layers: the project's universal gate on every part, and a specific check wherever one can be derived from the part's AC. A check is a command when a command exists, and a deterministic procedure otherwise — never a feeling.
4. **This skill reads the project** — the deliberate asymmetry with `slicer`. Package manifest scripts and CI config name the universal gate. When nothing does — a non-code task — the universal layer is empty and every Check is a specific procedure.
5. **No slices file → `slicer` first.** Slicer's input gate applies; if slicer refuses and recommends `deep-interview`, so does state-plan.
6. **Journal out, then stop.** No part execution, no commits, no delegation.

## Steps

### 1. Resolve the slices

- An explicit path from the user wins; otherwise glob `.plans/slices/*.md` for the named task.
- No slices file → invoke the `slicer` skill on whatever the user brought and use its output. Slicer's refusal ends this run too.
- Identify the source artifact from the slices file header — the journal links both.

### 2. Read the project for checks

- **Universal gate**: the commands the project already treats as its bar — package manifest scripts (typecheck, lint, test), CI workflow steps. Every part will carry it.
- **Specific Check** per part: derive from the slice's "Done when". A command when the AC names something runnable; otherwise a deterministic procedure — "grep for the old wording returns nothing", "the file is gone". Objective either way.
- No manifest, no CI, or not a code task: the universal layer is empty — drop the gate line rather than invent one.

### 3. Assemble the journal

Sections in order, template below:

- **Header** — source link (authoritative on scope) and slices link.
- **The slice** — the digest: 1–3 sentences, essence plus result — what the task is and what becomes true when it is done. Non-goals and scope disputes stay in the source, reached by the link.
- **How to use it** — the protocol. Its core travels into every journal: re-run the previous part's check before trusting it, record Last run verbatim, append to Decisions. The commit-code-and-plan-together rule is written only when the project versions `.plans/state/`; otherwise it is dropped.
- **Decisions** — an append-only journal of dated mini-ADRs. The entry filter: a choice another session could reasonably make differently — trivia stays out. The entry form: date, decision, motive, rejected alternatives with reasons — the work can show what was chosen, it cannot show what was rejected. A wrong decision is superseded by a later entry, never edited away. Planning-time decisions live in the ralplan ADR; this journal records execution-time ones.
- **Parts** — one per slice, same order, same dependencies: status (`todo` at birth), description, "Done when" from the slice, Check, "Last run: not yet".
- **Open questions** — carried from the source and the slices, plus any the assembly exposed.

### 4. Self-check — the cold-start test

Before writing, verify: could a fresh session, reading only this file and what it links, take the next part without asking the user anything? Concretely:

- [ ] Every part has status, description, "Done when", Check, "Last run: not yet", explicit dependencies
- [ ] Every Check is a command or a deterministic procedure — nothing subjective survives
- [ ] The universal gate is on every part when the project defines one
- [ ] The digest is 1–3 sentences; everything longer lives in the source, by link
- [ ] The protocol names: re-running the previous check, verbatim Last run, append-only Decisions, archiving on close

Fix and re-check in the same pass.

### 5. Write, report, stop

Write `.plans/state/{slug}.md`, report the path and the part count, and stop. Executing the first part is the user's next decision, in their next turn.

## Journal Template

```markdown
# {Task title} — state plan

- Source: {issue URL / spec path / plan path} — authoritative on scope
- Slices: {path}

## The slice

{1–3 sentences: the essence, and what becomes true when the task is done.}

## How to use it

1. Read this file, then the source.
2. **Re-run the previous part's check before you trust it.** What is recorded below is a claim by a session that no longer exists. If it does not reproduce, that is the work — before anything new starts.
3. Take one part: the lowest-numbered `todo` whose dependencies are all `done`.
4. Before stopping: set the part's status, record **Last run** verbatim — the date and what the check printed — and append anything you decided to **Decisions**.
5. A Check that proved inexact is refined in place; the next session inherits the better one.
6. A part that turns out wrong, or larger than it reads, is a decision to record and stop on. Changing this plan is allowed. Working around it silently is not.
7. {Commit the code and this file together. — only when the project versions `.plans/state/`}
8. When every part is `done`, move this file to `.plans/archive/`.

What belongs in **Decisions** is a choice another session could reasonably make differently. The work already shows what was chosen; it cannot show what was rejected.

{Every part, whatever else it runs: `{universal gate}`.}

## Decisions

Append. Do not rewrite an entry, and do not delete one — a decision that turned out wrong is superseded by a later entry saying so.

- **{date} — {decision}.** {Motive; alternatives rejected and why.}

## Parts

Status is `todo`, `doing`, `done`, or `blocked`.

### 1. {name} — `todo`

{What this part delivers.}

**Done when** {observable condition from the slice}.

- Check: {command | deterministic procedure}
- Last run: not yet
- Depends on: none

## Open questions

1. {question}
```

<Examples>
<Good>
A Decisions entry worth its place:
"**2026-08-02 — the session lasts six months.** The architecture doc says 'months, not hours' and picks no number. This is the number."
Why good: another session could reasonably pick a different number; the motive and the gap it closes are recorded.
</Good>
<Bad>
A Decisions entry that is trivia:
"**2026-08-02 — named the new module `session.ts`.**"
Why bad: no session would agonize over this; the code states it already. The filter is "could another session reasonably choose differently — and would it matter".
</Bad>
<Good>
Deriving a Check from a non-command AC:
AC: "no document describes a session rule the middleware does not implement."
Check: "`grep -r 'every route except login' docs/` returns nothing."
Why good: the subjective reading became a deterministic procedure with a yes/no answer.
</Good>
<Bad>
A Check that is a feeling:
"Check: read the docs and make sure they look consistent."
Why bad: two sessions can disagree about it. If no command exists, the procedure must still be deterministic.
</Bad>
</Examples>

<Final_Checklist>
- [ ] A slices file existed, or `slicer` ran first — and its refusal ended this run
- [ ] The project was read for the universal gate; every part carries it when one exists
- [ ] Every part: status `todo`, description, "Done when" from its slice, Check, "Last run: not yet", explicit dependencies
- [ ] Every Check is a command or a deterministic procedure
- [ ] Source linked and digested (1–3 sentences), not copied; inline only for bare-text tasks
- [ ] Protocol names: re-run the previous check, verbatim Last run, append-only Decisions, archive on close
- [ ] Commit-together rule included only per the project's documented versioning choice
- [ ] Cold-start test passed before the file was written
- [ ] Journal at `.plans/state/{slug}.md`, path and part count reported, then stopped
</Final_Checklist>
