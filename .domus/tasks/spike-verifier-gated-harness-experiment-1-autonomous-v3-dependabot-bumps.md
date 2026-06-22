# Task: Spike: verifier-gated harness + experiment 1 (autonomous v3 dependabot bumps)

**ID:** spike-verifier-gated-harness-experiment-1-autonomous-v3-dependabot-bumps
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-22
**Parent:** none
**Depends on:** none
**Idea:** verifier-gated-autopilot-harness-for-autonomous-dev-loops
**Spec refs:** none

---

## What This Task Is

A spike — the first deliberate "give AI a goal + a worktree and step out of the loop" experiment. Build the **minimal** verifier-gated autopilot harness and prove it on a zero-stakes target. The reusable artifact is the harness, not the v3 result. Full design rationale lives in the idea [[verifier-gated-autopilot-harness-for-autonomous-dev-loops]].

Harness components (minimal viable):
- **External oracle script** the harness runs and parses itself each iteration (`npm audit --json` + build + test). The agent never *declares* success — the script does. Progress/stop is decided by this un-fakeable signal, NOT the agent's self-assessment (the failure mode of a naive "ralph loop").
- **Anti-cheat diff gate** — reject any iteration that edits/deletes test files, or uses `--force` / `--legacy-peer-deps` / `@ts-ignore` / `eslint-disable` to fake green. Highest-value guardrail.
- **Checkpoint + rollback per iteration** — commit on verified improvement, revert on regression (worktree is the safety net).
- **Stuck detector + budget** — no net progress in N iterations or token/time cap hit → stop and report, don't thrash.

Target = **webclientv3** (`.slugignore`d, never deployed, slated for deletion → zero prod stakes). Scope to the **override-able non-Angular bundled vulns** (lodash / lodash-es / xmldom / fabric / canvg) plus build-chain transitives clearable via npm `overrides`. **Explicitly OUT of scope: the `@angular/*` vulns** — their fixes only exist in newer Angular majors, so they cannot be cleared without the full Angular migration. A well-harnessed agent should *report* that ceiling, not force-bump into a broken build (this is itself a built-in honesty test of the harness).

Stage 2 (after the harness works on v3): re-point at webclientv4's ~20 dev-scope alerts (a *kept* target). Stage 3 (stretch, separate): the Angular upgrade, only after adding a vision oracle.

---

## Acceptance Criteria

- [ ] A **machine-checkable success predicate is defined up front** (e.g. "target vuln set → 0 per `npm audit --json`, build green, tests green, diff touches only package.json/lockfile/overrides, no test/config files modified, override count ≤ N").
- [ ] A minimal harness exists with: external oracle script, anti-cheat diff gate, per-iteration checkpoint/rollback, stuck-detector + budget cap.
- [ ] One documented experiment run against webclientv3: what the predicate was, what cleared, what didn't, iteration count, whether the anti-cheat gate ever fired.
- [ ] The harness correctly **reports the `@angular/*` ceiling** rather than forcing an incompatible bump (honesty check).
- [ ] Written learnings: where the oracle held, where autonomy broke down, and what would need to change to (a) re-point at webclientv4 and (b) reach for the Angular upgrade.

---

## Implementation Notes

- Tooling decision is open: review-gated tier might run on `/loop` + a temporary CLAUDE.md; the trust tier likely needs a deterministic harness *wrapping* Claude Code. Resolving which is part of the spike (see the idea's open questions).
- This is a SPIKE: success = a working skeleton + learnings, not a polished, fully-general harness. Don't over-build.
