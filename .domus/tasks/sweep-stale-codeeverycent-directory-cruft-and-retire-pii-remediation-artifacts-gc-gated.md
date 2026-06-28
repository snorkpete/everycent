# Task: Sweep stale ~/code/everycent-* directory cruft and retire PII-remediation artifacts (GC-gated)

**ID:** sweep-stale-codeeverycent-directory-cruft-and-retire-pii-remediation-artifacts-gc-gated
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

A behaviour-preserving cleanup (healthcheck-category) of the accumulated `~/code/everycent-*` directory clutter. Root cause: the 2026-06-21 `git filter-repo` PII-history rewrite severed all pre-existing linked git worktrees, leaving orphaned non-git directory shells behind; plus there are stale clones and file dumps. Full inventory of what each directory is lives in the second-brain note `inbox/everycent-local-repo-landscape.md` (or its processed location).

**HARD PRECONDITION (gate):** Do NOT execute any deletion until the GitHub Support GC ticket #4500934 is fully confirmed closed. As of 2026-06-28 the last open blocker is GitHub confirming deletion of the closed (Dependabot) PRs that still deref old PII commit SHAs. While that is open, `everycent-backup` (pristine pre-rewrite rollback) and `everycent-rewrite` (rewrite sandbox) MUST be preserved as the rollback net.

**Scope when unblocked:**
- Retire `~/code/everycent-backup` (pristine pre-rewrite rollback) — only after GC confirmed.
- `rm -rf ~/code/everycent-rewrite` (rewrite sandbox), and shred `~/code/everycent-rewrite-replacements.txt` + `~/code/everycent-rewrite-paths.txt` (these hold REAL IBANs).
- Remove the empty/orphaned ex-worktree shells: `everycent-chat-settings`, `everycent-fix-abn-bullet`, `everycent-mcp-apigateway`, `everycent-mcp-refactor`, `everycent-refactor-transactions`, `everycent-worktrees/auto-allocation` — audit each for contents first (most are empty, but not individually verified).
- Assess `everycent-shallow` (>1yr stale clone, last active 2025-05-11) for removal.
- Sweep file dumps/archives: `everycent-files*`, `*.zip`, `everycent-test-files`.
- Keep: `everycent` (working repo) and `everycent-healthcheck` (standing internal-improvement worktree). Keep out-of-repo PII tracking docs (`everycent-payee-pii-cleanup.md`, `everycent-domus-pii-audit.md`) outside the public repo.

---

## Acceptance Criteria

- [ ] GC ticket #4500934 confirmed closed before any deletion (precondition documented in execution log).
- [ ] Each target directory audited for losable content before removal.
- [ ] `everycent` and `everycent-healthcheck` untouched.
- [ ] Real-IBAN `.txt` files securely shredded, not just `rm`'d.
