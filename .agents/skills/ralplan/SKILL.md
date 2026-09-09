---
name: ralplan
description: Consensus implementation planning through strict Planner → Architect → Critic iteration. Three isolated subagents argue until the plan survives review, then it lands in .plans/plans/. Use when a task is understood but the approach is not, or the user says "ralplan", "consensus plan", "plan this properly", "planner architect critic". Produces a plan and stops — it never implements.
---

<Purpose>
RALPLAN turns a spec into an implementation plan that has survived adversarial review. One agent drafts, a second attacks the architecture, a third gates on quality — each in its own isolated session, none allowed to approve its own work. The output is a plan marked `pending approval`. This skill plans and stops. It does not implement.
</Purpose>

<Use_When>
- Requirements are clear but the approach is not, and a wrong approach is expensive
- A `.plans/specs/*.md` spec exists (e.g. from `deep-interview`) and needs turning into a plan
- User says "ralplan", "consensus plan", "plan this properly", "get the architect and critic on it"
- Work touches auth, migrations, production, or public API and deserves a review gate
</Use_When>

<Do_Not_Use_When>
- The task is a one-file change or an obvious fix — just do it
- Requirements are still vague — run `deep-interview` first, then bring its spec here
- The user wants exploration or brainstorming rather than a committed plan
- A plan already exists and the user wants it executed
</Do_Not_Use_When>

## Configuration

Change these in one place; everything below refers to them.

| Setting            | Default                                                       |
| ------------------ | ------------------------------------------------------------- |
| Artifact root      | `.plans/`                                                     |
| Spec (input)       | `.plans/specs/{slug}.md`                                      |
| Round artifacts    | `.plans/drafts/ralplan-{slug}/round-{n}-{planner,architect,critic}.md` |
| Final plan         | `.plans/plans/ralplan-{slug}.md`                              |
| State file         | `.plans/.state/ralplan.json`                                  |
| Max rounds         | `5`                                                           |
| Role prompts       | `~/.pi/agent/agents/ralplan-{planner,architect,critic}.md`    |

`{slug}` is kebab-case derived from the task title. When an existing spec is reused, inherit its slug so spec, drafts, and plan stay a matched set — `deep-interview-auth-rework.md` yields slug `auth-rework`.

## Flags

| Flag           | Effect                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------- |
| `--deliberate` | Force DELIBERATE mode (pre-mortem + expanded test plan). Also auto-enables on risk signals |
| `--rounds N`   | Override the 5-round cap                                                                  |
| `--spec PATH`  | Use this spec instead of searching `.plans/specs/`                                        |

## 🛑 Hard Constraints

These exist to prevent **simulated consensus** — a single generation that invents a draft, a review, and an approval in one breath. That output looks identical to real consensus and is worth nothing.

1. **Isolated roles.** Each role runs as a separately invoked agent with its own context. You, the orchestrator, MUST NOT perform any role's work yourself.
2. **No single-turn consensus.** Never produce the plan, the architect review, and the critic verdict in one output block.
3. **Sequential, not parallel.** Await the Architect's complete verdict before invoking the Critic. Never batch the two in one parallel call — the Critic reviews what the Architect already said.
4. **Verbatim persistence.** When you write a role's output to `.plans/drafts/`, write what the agent returned. Do not summarize, improve, or soften a verdict.
5. **Mandatory pushback.** A first draft that passes both reviews untouched is a review failure, not a good draft. Reviewers that find nothing must state explicitly what they verified and why it holds.
6. **Planning boundary.** No source edits, no commits, no branches, no delegated implementation. The final plan is marked `pending approval` and you stop.

## Phase 0: Resolve the Spec

1. **Find a spec.** Check `--spec`, then glob `.plans/specs/*.md` for one matching the task. A `deep-interview-*.md` spec is the preferred input — it already carries acceptance criteria and a topology.
2. **No spec?** Write a short one to `.plans/specs/ralplan-{slug}.md` before planning: goal, constraints, non-goals, acceptance criteria (testable boolean statements), requirement coverage map. If the idea is too vague to write that honestly, stop and recommend `deep-interview` instead.
3. **Check for a resumable run.** Read `.plans/.state/ralplan.json`. If `active: true` and the idea matches, resume from the last completed round instead of restarting.
4. **Resolve mode.** DELIBERATE if `--deliberate` is set or the idea carries risk signals: `auth`, `security`, `credential`, `secret`, `password`, `token`, `migration`, `schema`, `database`, `production`, `destroy`, `delete`, `compliance`, `PII`, `GDPR`, `HIPAA`, `public API`, `breaking change`. Otherwise SHORT.
5. **Announce**: mode, spec path, round cap, and the three agents that will run.
6. **Initialize state** at `.plans/.state/ralplan.json`:

```json
{
  "active": true,
  "slug": "<slug>",
  "idea": "<one-line task>",
  "mode": "short|deliberate",
  "spec_path": "<path>",
  "round": 1,
  "max_rounds": 5,
  "rounds": [],
  "plan_path": null,
  "status": "planning"
}
```

## The Iteration Loop

Each state is one separately invoked agent. Update the state file after every state — an interrupted run must be resumable.

### State 1 — Planner

Invoke `ralplan-planner` with: the spec path, the target draft path `.plans/drafts/ralplan-{slug}/round-{n}-planner.md`, the mode, and — from round 2 on — every unresolved finding from the previous Architect and Critic reviews.

Produces the plan draft including the **RALPLAN-DR Summary**. From round 2, the draft must open with `## Changes in This Round`, addressing each prior finding explicitly: fixed, or rejected with a reason.

### State 2 — Architect

Invoke `ralplan-architect` with the draft path and the spec path. Read-only. Await the full verdict before doing anything else. Persist it verbatim to `round-{n}-architect.md`.

- `REVISION NEEDED` → back to State 1 with the findings.
- `APPROVE` → continue to State 3.

### State 3 — Critic

Invoke `ralplan-critic` with the draft path, the Architect review path, and the spec path. Read-only. Persist verbatim to `round-{n}-critic.md`.

- `ITERATE` or `REJECT` → back to State 1 with **both** reviews' findings. The next round runs the full closed loop again: Planner → Architect → Critic. Never skip back to the Critic alone.
- `APPROVE` → consensus. Write the final plan.

### Consensus

Assemble `.plans/plans/ralplan-{slug}.md` from the approved draft plus the ADR. Set state `active: false`, `status: "consensus"`, `plan_path`. Report the path, the round count, and the headline findings that changed the plan.

The plan is `pending approval`. Ask what should happen with it; do not start.

## Termination

| Condition                                                     | Action                                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Critic returns `APPROVE`                                       | Consensus. Write the final plan.                                                                  |
| Round cap reached without approval                             | Stop. Present the best draft, `status: "halted_max_rounds"`, and list what is still contested.     |
| Architect and Critic fundamentally disagree                    | Stop. `status: "escalated"`. Put the tension to the user as a decision, with both positions.       |
| Planner rejects the same finding twice                         | Stop. That is a spec-level disagreement, not a plan defect. Escalate to the user.                 |
| An agent returns no verdict line                               | Re-invoke that role once with the format requirement restated. Second failure is an escalation.    |

## Delegation

One role = one separately invoked agent, fresh context, awaited to completion.

**In pi** (`pi-subagents` installed) — the agents ship as user-scope definitions at `~/.pi/agent/agents/ralplan-*.md`:

```typescript
subagent({
  agent: "ralplan-architect",
  task: "Review .plans/drafts/ralplan-auth-rework/round-1-planner.md against .plans/specs/deep-interview-auth-rework.md. Return your review in the format your role defines."
})
```

Manual equivalent: `/run ralplan-critic "…"`. Do not use `context: "fork"` — forking hands the reviewer the parent's reasoning and the review stops being independent.

**In another harness**: read `~/.pi/agent/agents/ralplan-{role}.md`, pass its body (below the frontmatter) as the subagent's system prompt, and honor the tool restrictions declared there — Architect and Critic are read-only.

**Fallback, no subagent mechanism**: adopt one persona, produce that role's output, write it to its file, and **STOP** — ask the user to type "continue" before the next role. Three genuine passes separated by real turn boundaries. Never all three in one generation.

## RALPLAN-DR Summary (Planner, every round)

```markdown
## RALPLAN-DR Summary

**Mode:** SHORT | DELIBERATE

### Principles (3–5)
- [P1] …

### Top 3 Decision Drivers
1. [Driver] — [why it drives the decision]

### Viable Options (≥2)
**Option A:** … — Pros / Cons
**Option B:** … — Pros / Cons
_(If one option survives: explicit invalidation rationale for each rejected alternative.)_

### Pre-Mortem (DELIBERATE only — 3 scenarios)
- **Scenario:** [how it fails] → Mitigation: […]

### Expanded Test Plan (DELIBERATE only)
- Unit / Integration / E2E / Observability
```

## Final Plan Format

```markdown
# Plan: {title}

**Status:** pending approval
**Spec:** {spec_path}
**Consensus:** round {n} of {max} — Planner / Architect / Critic
**Mode:** SHORT | DELIBERATE

## Architecture Decision Record
- **Decision:** one sentence
- **Drivers:** top 3, with rationale
- **Alternatives Considered:** rejected options and why
- **Why Chosen:** …
- **Consequences:** positive and negative
- **Follow-ups:** deferred items

## Task Breakdown
Numbered steps, each with exact file paths and an acceptance criterion an executor can verify alone.

## Dependency Graph
Execution order; what can run in parallel.

## Acceptance Criteria
Testable boolean statements, traceable to the spec.

## Risk Register
| Risk | Likelihood | Impact | Mitigation |

## Review Trail
Round-by-round: what each reviewer found and how it changed the plan.
```

<Final_Checklist>
- [ ] Every role ran as a separately invoked agent — orchestrator wrote no role content itself
- [ ] Architect completed before the Critic was invoked, never batched in parallel
- [ ] Reviews persisted verbatim, verdicts unedited
- [ ] Every non-APPROVE verdict looped through the full Planner → Architect → Critic cycle
- [ ] Each round's draft addressed every prior finding: fixed or explicitly rejected with a reason
- [ ] DELIBERATE mode resolved from risk signals, and its pre-mortem and test plan are present when it applies
- [ ] Final plan has ADR, task breakdown with real file paths, dependency graph, acceptance criteria, risk register
- [ ] Plan written to `.plans/plans/ralplan-{slug}.md`; state file updated and `active: false`
- [ ] Plan marked `pending approval` — nothing implemented, no files edited outside `.plans/`, no execution delegated
</Final_Checklist>
