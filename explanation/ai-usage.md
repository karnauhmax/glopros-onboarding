# AI usage

How this repo was built with agents, and what kept the output reviewable.

## The skills

I copied all five into `.agents/skills/` exactly as they sit on my machine. This project does not
install them; the copies are there so you can read what produced the code. Paths like `.plans/`
inside them are their own defaults, not this repo's layout.

The subagents the skills hand work to are copied the same way, into
[`.agents/agents/`](../.agents/agents): `executor`, plus the three
`ralplan-{planner,architect,critic}` role prompts.

**deep-interview** asks one question per round, aimed at whichever dimension scores lowest: goal,
constraints, success criteria, context. It rescores after every answer and refuses to write a spec
while ambiguity is above 20%. Stages here took 6 to 12 rounds. Worth the time when a wrong guess is
expensive, because you argue about scope before the branch exists rather than after.

**ralplan** runs a planner, an architect and a critic as three separate agents. Nobody approves their
own work, and a draft that passes both reviews untouched counts as a failed review, not a good draft.
It produces a plan and stops. Take it when the approach is riskier than the requirements. You get two
opinions that never saw the reasoning behind the draft.

**slicer** cuts a spec into vertical slices, each a thin path through every layer it touches and each
sized to one session. Every slice gets a "Done when" line taken from the source. It reads nothing
outside its input, not one repository file. The result is pieces small enough to review. Left alone,
an agent writes the whole feature in one go and hands back a diff nobody can check.

**state-plan** turns those slices into a journal a fresh session can pick up: a status per part, a
check that is a real command wherever one exists, the last run recorded verbatim, and an append-only
decision log. Its main rule is to re-run the previous check before trusting it. It is what lets a
task survive a lost session. Come back two days later and the file says what is done, what proved it,
and what was decided.

**unslop** is the style pass. It ran at the end of every stage over that stage's files, prose and code
alike, and it is where the redundant comments and the four duplicate sign-up tests went. Agents pad
by default, so without it the repo fills with comments restating the code and tests covering the same
case twice.

## The gates

Four commands have to exit zero before anything is committed:

```bash
pnpm lint            # eslint . --max-warnings 0
pnpm typecheck       # next typegen && tsc --noEmit
pnpm test            # jest
pnpm test:mutation   # stryker run
```

Stryker adds mutation testing on top of the unit tests, and it is the one I would keep if I could
only keep one. Agents are good at writing tests that pass, and coverage only proves a line ran.
Stryker breaks the code on purpose and expects a test to fail, which catches a test that asserts
nothing.

ESLint is set up for structure, not only formatting. The module boundaries from
`docs/architecture.md` are import rules, so crossing one is an error and not a review comment.
TypeScript runs strict. Prettier and husky keep formatting out of the diffs.

## The docs

`docs/` is the source of truth. Each of the four files answers one question, nothing is repeated
between them, and the README maps which is which. `AGENTS.md` names the one to read before a given
kind of change: `product.md` before touching anything, `architecture.md` when creating or moving a
file, `design/figma-reference.md` when styling, `testing.md` when writing a test.

A rule and its documentation move in the same commit. A doc that contradicts the code is worse than
no doc, because an agent believes it.

## AGENTS.md

`AGENTS.md` is a router: a table pointing at the right doc, three always-apply rules, and the block
`next dev` writes for itself. `CLAUDE.md` is one line pointing back at it, so both toolchains read
the same file.

It stays that way on purpose. Rules copied into a router drift from the doc they came from, and an
agent that has read the summary will think it read the source.

## Design

The Figma MCP read the design file directly. Colours, type scale, spacing and the exported assets
came over as values, so nothing had to be measured off a screenshot, and the numbers in the theme are
the numbers in Figma. `docs/design/figma-reference.md` records what came back, including the places
where the design and the acceptance criteria disagree.

## Browser access

Vercel's agent-browser gave the agent a real browser against the dev server. It walked the flow after
each step and checked redirects, validation on blur, the mocked errors and the state after a reload
in Chrome, not only in jsdom.
