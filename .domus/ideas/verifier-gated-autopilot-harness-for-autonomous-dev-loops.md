# Idea: Verifier-Gated Autopilot Harness for Autonomous Dev Loops

**Captured:** 2026-06-22
**Status:** raw

---

## The Idea

A reusable harness that takes **a goal + a worktree** and drives an AI loop to a
**machine-checkable "stable, working" conclusion** — Kion's first deliberate step
toward giving AI a goal and stepping (partly) out of the loop.

The defining property is **not** "run an agent in a loop." It's that **progress and
the stop condition are decided by an external, un-fakeable verifier — never the
agent's own self-assessment.** A naive "ralph loop" (re-prompt the same goal until
the agent says *done*) fails precisely because it trusts the agent's self-report.
The whole game is to make the loop converge against a signal the agent cannot game.

### The trust dial (the unifying frame)

There aren't two modes ("review-gated" vs "trust"). There is **one dial** with two
ends, and the position is set by a single variable: **how much of what a human
reviewer would check can be encoded as a deterministic gate.**

- **Near the trust end** = almost nothing is irreducible (e.g. dependabot bumps:
  "diff touches only lockfiles/package.json, override count under N, audit clean,
  build + tests green" — that's the *entire* review, and it's encodable, so green
  really can = go).
- **Near the review end** = a large irreducible chunk resists encoding (e.g. the
  Angular upgrade: "does the layout still look right after flex-layout dies" is
  visual judgment).

The task's **stakes** are not what sets the dial — the **specifiability of the
review** is.

### The ratchet (how the dial moves toward trust over time)

Human review stops being a gate that approves/rejects and becomes **the mechanism
by which the oracle grows.** Each cycle: loop pauses → human gives feedback on
what's wrong → refine *with the human* into **new verifiable facts** → re-run.
Every pass compiles a chunk of "I'd know it when I see it" into the specifiable
bucket. Two concrete dials for handling recurring issues:

1. **Push upstream** — update the *code-building / generation* instructions so the
   recurring issue stops being produced at all (the ideal: fix the source).
2. **Encode downstream** — update the *review/audit* process to auto-handle a class
   (skip the noise, or auto-fix the mechanical) so it never reaches the human's
   desk again.

Net effect: the pile of things only the human needs to look at **shrinks every
cycle.** The loop gets bigger and skips the human more, because the human's
judgments keep getting compiled into the harness.

### The governing principle: autopilot, hands on the wheel

**The human is permanently in the loop — because the human is ultimately
responsible**, not as a bottleneck but as the accountable party. The loop
automates what it can be *trusted* to do (oracle-backed) and **escalates what it
can't** — high blast radius, or irreducible judgment. With enough skill the loop
gets large and skips the human often (his rules live in the harness), but he can
**interrupt at any point**. Autopilot on; still in the driver's seat. "Hands off
the wheel entirely" was never the real goal — **moving his hands to the part only
he can do (deciding) was.**

### Harness components (the reusable artifact)

The durable output of this whole line of work is **the harness, not any one task's
result.** Minimum viable scaffolding:

- **External oracle script** the loop runs each iteration and parses itself (e.g.
  `npm audit --json` + `build` + `test`). The agent never *declares* success — the
  script does.
- **Anti-cheat diff gate** — reject any iteration that edits/deletes test files or
  uses `--force` / `--legacy-peer-deps` / `@ts-ignore` / `eslint-disable` to fake
  green. Highest-value guardrail; without it the agent finds the lazy path.
- **Checkpoint + rollback per iteration** — commit on verified improvement, revert
  on regression. (This is what worktrees are for.)
- **Stuck detector + budget** — no net progress in N iterations, or token/time cap
  hit → stop and report state, don't thrash.
- **Vision oracle (extension, for visual tasks)** — a vision LLM comparing
  before/after screenshots of changed screens until they match, giving a
  "somewhat deterministic" quality signal that converts visual judgment into a
  gate (the mechanism that would let the Angular upgrade climb the dial).

### Staged experiment plan

1. **Debug the harness on webclientv3 dependabot bumps** — zero prod stakes (v3 is
   `.slugignore`d and being deleted), crisp termination (audit→0), behaviour
   preserved so "build + tests green" is a legitimate oracle. Built-in honesty
   test: the framework-coupled `@angular/*` vulns *can't* be cleared without the
   migration — a well-harnessed agent reports that limit; a badly-harnessed one
   force-bumps to an incompatible version and breaks the build. Great signal.
2. **Re-point at webclientv4's ~20 dev-scope alerts** — same shape, but the target
   is *kept*, so a successful run produces something real.
3. **Stretch: autonomous Angular 14→21 upgrade** — only after adding the vision
   oracle. Expect to address shortcomings and *probably give up*; the value is
   learning where autonomy ends. (Target 21, not 22 — 21 is in LTS through ~May
   2027, so no need for the bleeding edge on a throwaway.)

---

## Why This Is Worth Doing

- **Personal/learning value (primary):** Kion has always kept himself in the loop
  for AI dev work. This is the deliberate experiment in stepping out — and the way
  to do it responsibly (verifier-gated, low stakes first) rather than hopefully.
- **It builds a reusable capability, not a one-off.** The harness generalises across
  every oracle-able task class.
- **It unlocks the real prize:** a **self-converging healthcheck loop** (audit →
  triage → fix → re-audit → converge). See
  [[automate-the-healthcheck-loop-into-a-self-cleaning-system]], which **leverages
  this harness** as its execution substrate.
- **Fits Kion's profile** — relocates the human to the *deciding* seat (the part he
  values and which is least encodable) and out of the execution grind.

---

## Open Questions / Things to Explore

- **Where does the oracle simply not exist?** For *doing* a well-specified fix the
  oracle is strong (tests/build/audit). For *deciding what's worth fixing* (audit +
  triage) it's weak-to-absent. Hypothesis: **triage stays human permanently**, and
  that's correct, not a gap to engineer away.
- **Healthcheck convergence is the dangerous case.** When the loop *generates* the
  work, *does* it, and *judges* "no tasks left," where is the external oracle?
  Kion's first-pass: an LLM checker filters duplicate / "silly" / not-worth-it
  tasks, declare done when only nonsense remains, plus a hard max-iteration cap.
  Risk: that puts an LLM in the judge's seat with no external oracle (self-
  deception at the system level). Is "diminishing returns, human-validated" the
  honest convergence signal? Does the audit itself become a loop stage?
- **Tooling: `/loop` vs a deterministic external harness around Claude Code.** The
  review-gated tier could likely run on `/loop` + explicit instructions in a
  temporary CLAUDE.md (cheap). The trust tier needs a real deterministic harness
  *wrapping* Claude Code (external orchestration + verifier), not Claude self-
  managing. Where's the crossover, and is the `/loop` version a useful stepping
  stone or a dead end?
- **How is feedback mechanically compiled into checks?** The ratchet is the core
  value — what's the actual workflow for turning "this was wrong" into a new
  deterministic gate (or an upstream instruction change)?
- **Vision-oracle determinism.** How reliably can a vision LLM do screenshot-match
  acceptance? Enough to gate on, or only to *reduce* the human's visual review?
- **Defining "stable, working" as a machine-checkable predicate up front** — the
  discipline that separates a real autonomous target from a fuzzy one. Dependabot
  admits a crisp predicate; the Angular upgrade mostly doesn't (which is exactly
  why it's the wrong first target).

---

## Related

- [[automate-the-healthcheck-loop-into-a-self-cleaning-system]] — a primary
  **consumer** of this harness (the self-cleaning audit→fix→converge loop runs on
  it).
- [[hunter-llm-powered-bug-reporting-autonomous-fix-pipeline]] — sibling
  autonomous-pipeline idea; another candidate consumer of the same harness.
