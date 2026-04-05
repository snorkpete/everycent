# Memory Audit Plan (2026-04-04)

Plan for cleaning up `/Users/kion/.claude/projects/-Users-kion-code-everycent/memory/`.

## Session Status (for resuming in a fresh session)

**Branch:** `memory-audit` (NOT master — a mid-session branch-switch by another session caused the B1 agent's edits to land on master temporarily; recovered via stash+checkout)

**Do NOT run `session-recap` for this audit session** — use this plan as the resume document instead. The next-up.md file is managed by the audit itself; recap would be circular.

**Completed batches:**
- ✅ Plan committed
- ✅ Session A — Memory cleanup (52→47 files, 5 retirements + merges + frontmatter sweep)
- ✅ Session B1 — Git/worktree rules → CLAUDE.md (47→38 files, Confidence Signaling removed, 4 new sections, Heroku mappings)
- ✅ Session B2 — Worker Dispatch Protocol → CLAUDE.md (38→34 files, 1 new section)
- ✅ Session B3 — Debugging + Browser Testing → CLAUDE.md (34→29 files, 2 new sections)
- ✅ Session B4 — Refactor discipline + Design philosophy + PrimeVue builtins → CLAUDE.md + webclientv4/CLAUDE.md (29→24 files, 2 new project sections + 1 webclientv4 line for PrimeVue)
- ✅ Session B5 — Housekeeping commits + domus meta-rule + bang-assertion nuance → CLAUDE.md (24→19 files, 1 new section + Domus Workflow expansion + Pre-Commit rule inline nuance)
- ✅ Session-recap agent spec refined twice at `~/.claude/agents/session-recap.md` (session-aware writes, volatile-content exclusions, mid-session change detection, checkout guard, MIGRATION_PLAN.md removed)
- ✅ Global `~/.claude/CLAUDE.md` updated with rewritten rules + Interaction Style + Delegation + Where Things Go sections
- ✅ 2 side memory files captured during parallel session: `feedback_page_spec_integration_style.md` (staged for Session E migration to vue-testing-patterns.md), `feedback_worktree_main_ask_first.md` (useful half promoted to Worktree Branching subsection, contradicting half retired)

**Memory at 19 files** (target: ~11).

**Next batch to execute: Session D** — `/docs/` structure + code doc migrations (4 more memory files retire after migration: useResponsive, EcMoneyDisplay, bank_account_api sort, ics_import_research)

**Execution pattern that's working:** dispatch a general-purpose agent with `model: "sonnet"`, tight scope (4-5 files per batch), explicit branch guard ("do not switch branches, do not commit"), verify + commit in main session.

**Known risks to guard against:**
- Branch-switching during agent runs (mitigated by explicit guard in prompts)
- Agent writing fresh plan file when it can't find an existing one (mitigated now — plan is committed)
- Context bloat from showing full diffs inline (use `git diff --stat` first, full diff only if needed)

**Remaining work order (proposed):**
1. Session D — `/docs/` structure + code doc migrations (useResponsive → JSDoc, EcMoneyDisplay → JSDoc, bank_account_api → inline comments on controller, ics_import_research → `/docs/decisions/ics-import.md` ADR) — 4 more memory retirements
2. Session E — webclientv4 updates (TypeScript Notes, useResponsive reference, fix broken docs reference) + `webclientv4/docs/vue-testing-patterns.md` creation (from `testing-patterns.md` + `feedback_composable_spec_setup.md` + `feedback_refactor_to_factories.md` + the staged `feedback_page_spec_integration_style.md`) — 4 more memory retirements
3. Session C-followup — retire `feedback_no_cheerleading.md`, `feedback_linus_hat_default.md`, `feedback_frame_uncertainty.md` (content already in global CLAUDE.md Interaction Style)
4. Session F — Hooks (interactive, NOT agent)
5. Final cleanup: migrate `claude_test_user.md` to `.claude/local-dev.md` (gitignored); convert vocabulary JSONL → markdown; shrink project CLAUDE.md vocab section; move `feedback_session_context_management.md` to user-level

**When resuming:**
1. `git -C /Users/kion/code/everycent status` — verify on `memory-audit` branch
2. Read this plan file for full context
3. Pick next batch (currently B3)
4. Dispatch agent with the batch scope from section B of this plan

---

Phase 1 (memory review) complete. Phase 2 (CLAUDE.md reviews) in progress.

---

## Summary

51 memory files audited. Target state: ~11 memory files; the rest become:
- Project CLAUDE.md rules (consolidated)
- Global `~/.claude/CLAUDE.md` rules (user-level)
- `webclientv4/CLAUDE.md` additions
- `webclientv4/docs/vue-coding-rules.md` additions
- Code docs / inline comments
- Top-level `/docs/` files (new structure)
- Retirements

Net effect: memory drops from 51 → ~11 files. Rest migrates to properly-located docs/rules.

---

## Actions by target

### A. Memory (keeps, 9 files)

Stay as-is (all verified accurate):
- `project_next-up.md` — **prune first**: strip status of merged branches + "Git State" section (checkable via git); move "TypeScript Notes" to `webclientv4/CLAUDE.md`
- `user_communication_patterns.md` — **merge into** `collaboration-preferences.md` then retire standalone
- `what-feels-like-work.md`
- `collaboration-preferences.md` — **cleanup**: remove "Skills and Agents: Do First, Extract After" (duplicates global CLAUDE.md); add YAML frontmatter; consider promoting "The Artifact Hierarchy" to global CLAUDE.md
- `domus-design-influences.md`
- `insight_code_quality_ai.md`
- `reference_ai_coding_article.md`
- `feedback_task_capture_fields.md` — **prune**: strip specific field list (stale), keep meta-rule only (may promote to CLAUDE.md)
- `feedback_worker_model.md` — may promote to CLAUDE.md

### B. Promote to project CLAUDE.md (21 files, ~10 consolidated sections)

Progressive disclosure: headline in CLAUDE.md + `/docs/<topic>/` detail files where warranted.

**Landing worktrees & review gate** (3 → 1 section)
- `feedback_landing_worktree.md`
- `feedback_ready_for_prod_sync.md`
- `feedback_stop_before_merge.md`

**Merge strategy extensions** (3 → expand existing Merge Strategy section)
- `feedback_verify_branch_before_commit.md`
- `feedback_rebase_over_merge.md`
- `feedback_no_stashing_main_worktree.md`

**Ready-for-prod pattern** (1 → elevate ff-only invariant)
- `project_ready_for_prod_branch.md`

**Worktree branching context** (1 → new subsection) ⚠️ **FLIP direction**: branch from master by default
- `feedback_worktree_branching.md`

**Worker dispatch & verification protocol** (3 → 1 new section)
- `feedback_worker_branch_review_cycle.md`
- `feedback_worker_dispatch.md`
- `feedback_worker_reliability.md`

**Debugging: pre-fix validation sequence** (3 → 1 section)
- `feedback_server_check_before_debugging.md`
- `feedback_reproduce_before_fixing.md`
- `feedback_visual_before_tests.md`

**Browser testing & automation** (2 → 1 section)
- `feedback_mobile_emulator_not_resize.md`
- `feedback_no_mixing_browser_tools.md`

**Refactor discipline** (2 → 1 subsection of Code Review)
- `feedback_refactor_review.md`
- `feedback_refactor_scope_pushback.md`

**Design philosophy** (2 → 1 new section)
- `feedback_reference_implementations.md`
- `feedback_component_extraction_lens.md`

**PrimeVue best practices** (1 → add to existing PrimeVue mention)
- `feedback_primevue_builtins.md`

**Housekeeping commits & index safety** (3 → 1 section)
- `feedback_master_commits_domus_claudemd.md`
- `feedback_vocab_commits.md`
- `feedback_domus_commit_hygiene.md`

**Deployment** (1 → add to existing Deployment section)
- `heroku_apps.md`

**Domus** (1 meta-rule → add to Domus Workflow section)
- `feedback_task_capture_fields.md` (pruned to meta-rule only)

**Worker Dispatch** (1 line)
- `feedback_worker_model.md`

**TS bang assertion nuance** (merge into existing rule, then retire)
- `feedback_no_bang_assertions.md` — add spec-file vs prod-code nuance to CLAUDE.md line 71, then retire the memory

### C. Promote to global `~/.claude/CLAUDE.md` (3 files + rewrites + additions)

**Approved rewritten rules** (combined #1+#2, tightened #3-6, removed Model Switching):

```markdown
# Global Preferences

- Ask clarifying questions before proposing solutions. You MUST verify the plan with me before making code changes — don't just announce what you're about to do.
- Never make changes on master. Create a feature branch first.
- No `Co-Authored-By: Claude` in commit messages.
- Never chain bash commands with `&&`. Run each separately.
- When the user proposes a new skill or agent, nudge toward doing the work manually first — pattern emerges, then extract. Don't design upfront.
```

**Approved additions:**

```markdown
## Interaction Style

Act as a senior dev partner — my technical equal on craft. I retain decision-making authority.

- Skip affirmations ("good call", "absolutely"). Lead with substance.
- Default to critical feedback on review/refinement questions. Push back, flag risks, don't validate for the sake of validating.
- When uncertain, say so. Frame tradeoffs, give your instinct, flag limits.

## Delegation

- Default to dispatching investigations/exploration to sub-agents (Explore, general-purpose). Keeps main session context clean. Exception: small directed lookups.

## Where Things Go

| Artifact | Purpose |
|---|---|
| CLAUDE.md (global or project) | Behavioral rules — how Claude acts |
| Memory | About the user, environment, non-obvious setup |
| Skills | Reusable procedures invoked explicitly |
| Docs / ADRs (in repo) | Code documentation, decisions, reference |

Don't default to memory. Ask: rule, context, procedure, or code?
```

Memory files retired after this promotion: `feedback_no_cheerleading.md`, `feedback_linus_hat_default.md`, `feedback_frame_uncertainty.md`.

### D. Promote to user-level (2 files)

- `feedback_session_context_management.md` → global CLAUDE.md OR new `~/.claude/user-memory/` directory
- `claude_test_user.md` → establish `.claude/local-dev.md` (gitignored) convention; migrate content there; reference from project CLAUDE.md

### E. webclientv4/CLAUDE.md + docs updates

**Additions to `webclientv4/CLAUDE.md`:**
- **TypeScript Notes** to Development Setup: `vue-tsc -b --noEmit` (`-b` essential), `rm node_modules/.tmp/tsconfig.app.tsbuildinfo` for stale cache (from `project_next-up.md`)
- **`useResponsive`** reference to Coding Conventions — single source of truth for breakpoints (from `project_useresponsive.md`)
- **Fix broken reference** at line 45: `docs/testing-patterns.md` → `docs/vue-testing-patterns.md`

**Additions to `webclientv4/docs/vue-coding-rules.md`:**
- Composable `setup()` helper convention (from `feedback_composable_spec_setup.md`)
- Const-object + type pattern for domain enums (from `project_ecmoneydisplay.md`)

**New file: `webclientv4/docs/vue-testing-patterns.md`** (named this way so it can later move to top-level `/docs/testing/` cleanly):
- Content from existing memory `testing-patterns.md`
- Migrate-on-touch factories rule (from `feedback_refactor_to_factories.md`) with retirement criteria

### F. Migrate to `/docs/` (4 files) — **new top-level structure**

**`/docs/decisions/` (ADRs):**
- `project_ics_import_research.md` → `/docs/decisions/ics-import.md`

**Code docs / inline comments:**
- `project_useresponsive.md` → JSDoc on composable (webclientv4/CLAUDE.md already references it per section E)
- `project_ecmoneydisplay.md` → component-level JSDoc (pattern rule goes to vue-coding-rules.md per section E)
- `bank_account_api_sort_behaviour.md` → inline comments on `BankAccountsController#index` and `bankAccountApi` methods

### G. Retire (7 files)

- `feedback_primevue_tooltips.md` — already in `webclientv4/CLAUDE.md` line 37
- `feedback_domus_update_workflow.md` — workaround obsolete (tool changed)
- `feedback_no_bang_assertions.md` — after merging nuance into CLAUDE.md
- `project_vocabulary_system.md` — fully documented in project CLAUDE.md
- `project_claudemd_as_hooks.md` — experiment failed (pre-commit hooks now exist; memory duplication shows rules alone aren't enough)
- `user_communication_patterns.md` — after merging into `collaboration-preferences.md`

---

## Accumulated follow-ups (execution tasks)

1. **Update `session-recap` agent**: don't capture merge status or git state in next-up.md (they go stale, checkable in seconds). Only names as pointers.
2. **Update `session-recap` agent**: make session-aware so parallel sessions don't clobber each other's next-up writes.
3. **Edit `project_next-up.md`**: strip status/git state sections; move TypeScript Notes to `webclientv4/CLAUDE.md`.
4. **Move TypeScript Notes** → `webclientv4/CLAUDE.md`.
5. **Establish `.claude/local-dev.md`** (gitignored) convention; migrate `claude_test_user.md` there; reference from project CLAUDE.md.
6. **Merge `user_communication_patterns.md`** into `collaboration-preferences.md` as "Tone Signals" section; retire standalone file.
7. **Add YAML frontmatter** to memory files missing it (tracked as session task #1).
8. **Create domus task** for factories migration with completion criteria (so `refactor_to_factories` rule can retire when done).
9. **Verify `webclientv4/CLAUDE.md` line 37** still says `v-tooltip`, then retire `feedback_primevue_tooltips.md`.
10. **Establish `/docs/` top-level structure**: start with `/docs/decisions/` and `/docs/testing/`.
11. **Establish `~/.claude/user-memory/` directory** (optional) OR just promote to global CLAUDE.md.
12. **Session-recap agent task** (tracked as session task #2).

---

## Phase 2: CLAUDE.md reviews

### Global `~/.claude/CLAUDE.md` — COMPLETE
See section C above for approved rewrites and additions.

### webclientv4/CLAUDE.md — COMPLETE
See section E above for approved changes.

### Project `CLAUDE.md` changes

**Remove:** Confidence Signaling section — covered by global CLAUDE.md's new Interaction Style > frame uncertainty rule.

**Vocabulary section cleanup:**
- Shrink 27-line section to ~3 lines (pointer + brief usage)
- Move loading/updating/growing rules to `vocabulary/INSTRUCTIONS.md`
- **Convert `vocabulary.jsonl` → `vocabulary.md`** (MEMORY.md-style list, easier to scan, same token cost since it's effectively always-loaded via CLAUDE.md instruction)

**Build & Release section — annotate:**
- v3 (Angular) is frozen, v1 (AngularJS) is dormant
- This section only needed for occasional v3/v1 rebuilds during v4 cutover
- Future: retire entirely once v4 becomes default (pending reports migration)

**Deployment section — note for future `/deploy` skill:**
- Include `heroku run rails db:migrate` step (idempotent, safe every time)
- Smarter detection (check for pending migrations) is optional polish

**Skill candidates (deferred to later pass):**
Flagged but NOT extracting now — consolidating into CLAUDE.md first per do-work-first rule.
- `/build-release` (v3/v1 builds — may retire with v4 cutover)
- `/deploy` (Vue v4 + 3-remote push + rails db:migrate)
- `/commit` (type-check + test + rspec gauntlet)
- `/review` (senior-code-reviewer + domus check + apply feedback)
- `/update-vocab` (vocab update/growth procedure)

---

## Phase 3: Hooks (interactive implementation)

**Deterministic enforcement candidates** (to convert instruction → hook):
1. **Branch check on `git commit`** — PreToolUse on Bash matching `git commit`, block if on master
2. **No `&&` in bash** — PreToolUse on Bash, reject commands containing ` && `
3. **Pre-commit gauntlet** — PreToolUse on `git commit`, run type-check + test + rspec
4. **Strip `Co-Authored-By: Claude`** — PostToolUse or PreToolUse on commit message

**Approach:** interactive session where Claude explains hook mechanics as we implement each. User new to hooks — learning-oriented.

> **Note (2026-04-05):** Use agents judiciously in interactive sessions — move planned execution work to agents to preserve main conversation context. This extends the existing Delegation rule (which only covers investigation/exploration) to execution work: if a session task is well-defined enough to run unattended, dispatch it.

> **Resolved (2026-04-05):** "Default to separate worktree" rule added to project CLAUDE.md's Worktrees subsection (scoped to everycent — pattern user adopted here, may or may not apply to other projects). Related Delegation rule extended in global CLAUDE.md to cover planned execution work, not just investigations.

> **Follow-up (2026-04-05):** Verify the `issue #38287` reference added by the B1 agent in the Landing Worktree Branches step 6 — could be real callback or hallucinated. Capture as a domus task.

---

## Execution strategy

Batch the changes in separate sessions by target area:

- **Session A**: Memory cleanup (retirements, prunings, merges, frontmatter sweep) + session-recap agent update
- **Session B**: Project CLAUDE.md additions (all 10 new sections) + retirement of promoted memory files
- **Session C**: Global CLAUDE.md additions + user-memory directory setup (if chosen)
- **Session D**: `/docs/` structure setup + migration of code docs + inline comment additions
- **Session E**: `webclientv4/` additions (CLAUDE.md + vue-coding-rules.md + testing-patterns.md)

Keep each session focused on one target to avoid context bloat and mixed-concern commits.
