# Idea: Domus task commit workflow

**Captured:** 2026-03-15
**Status:** raw

---

## The Idea

Domus task and idea files sit in .domus/ and are tracked by git, but there's no clear convention for when to commit them. They can drift uncommitted for long periods. Need to figure out the right trigger points — e.g. end of session, when a task transitions to done, when a spec is finalised — and whether they should be batched with related code commits or kept separate.

---

## Why This Is Worth Doing

_To be filled in._

---

## Open Questions / Things to Explore

- Should domus state be bundled with the related code commit (e.g. mark task done in the same commit as the code that completes it), or kept separate? Bundling keeps context together; separating keeps code commits clean and domus commits auditable on their own.
- End-of-session batch commit is simple but means domus state can lag behind reality mid-session — if a session is interrupted, work is untracked.
- Per-transition commit (commit whenever a task changes status or a spec is finalised) is more precise but adds ceremony and requires remembering to do it.
- Is there a hybrid? e.g. code + status-change in one commit, but spec/body edits batched at end of session.
