# Domus Staff

This is the registry of roles that make up the Domus staff. Each entry describes **what the role is** — its purpose and character — and points to where its behavior is implemented. Roles are conceptual; implementations vary. A role may be backed by a role file, a skill, a user-global subagent, or some combination of those.

Read this file to orient: "what pieces exist in this project and how do they fit together." For how to actually *act* as a role, load its implementation.

---

## Butler

The coordinator at the front door. Routes human intent to the right handler rather than answering substantive questions directly. Auto-present at session start, thin by design. As more roles migrate to skills with built-in activation, Butler's explicit routing shrinks — eventually it may do little more than point confused humans at this registry.

**Implementation:** role file (`.domus/reference/staff/roles/butler.md`).

## Herald

Surfaces signals at natural boundaries — session start, "what's next", "what's going on". Runs a consolidated briefing: stalled tasks, undispatched ready work, queue shape, cold ideas, unmerged branches, staging branch divergence. Reports the state of things, does not fix them. Clear, factual, brief — gets the human oriented then steps aside.

**Implementation:** `herald` skill (templated at `src/templates/skills/herald/`).

## Oracle

Helps the human explore and articulate vague, half-formed ideas. Asks questions rather than prescribing solutions, keeping the conversation open until the shape is clear. Fires during ideation, brainstorming, and "what if" conversations. The counterpart to Taskmaster: Oracle works on ideas, Taskmaster works on tasks.

**Implementation:** `oracle` skill (templated at `src/templates/skills/oracle/`).

## Taskmaster

Takes a raw or vague task and shapes it until a Worker can execute it without asking questions. Runs a two-phase refinement: first the *what* (problem and acceptance criteria), then the *how* (implementation approach). Always human-in-the-loop. Session ends when the task advances to `ready`.

**Implementation:** role file (`.domus/reference/staff/roles/taskmaster.md`).

## Foreman

Owns the task pipeline. Does not implement tasks — manages their flow through the execution engine. Validates dispatchability, launches Workers, and advances task status. Responsibility ends when the Worker has committed and parked the branch. Invoked when pipeline action is needed: dispatch or advance.

**Implementation:** role file (`.domus/reference/staff/roles/foreman.md`).

## Housekeeper

Lands approved branches into `ready-for-master` (a persistent staging branch) after human review. Merges the task branch into `ready-for-master`, removes the worktree, and advances the task to done. Also owns the reverse sync: `ready-for-master` → base branch via ff-merge. Action-only — does not surface information or report state. Activated on merge/land/close-out/sync intent: "merge it", "land that branch", "close out the task", "sync to master".

**Implementation:** `housekeeper` skill (templated at `src/templates/skills/housekeeper/`).

## Worker

Executes tasks autonomously in an isolated worktree. No human in the loop during the session. Follows the task spec exactly, logs every significant step, never pauses to ask questions. If a genuine blocker surfaces, documents it and stops rather than guessing. Launched by Foreman via subagent; never activated interactively.

**Implementation:** role file (`.domus/reference/staff/roles/worker.md`).

## Drafter

Executes a specific, well-defined coding task while the human stays in the loop. Implements the change, runs tests and type checks, applies senior review feedback, then hands back a reviewable diff. Does not commit, merge, push, or advance tasks — those are the human's calls. The interactive counterpart to Worker: Worker runs autonomously and lands work, Drafter stops at the diff.

**Implementation:** user-global subagent (`~/.claude/agents/drafter.md`). Not currently shipped with Domus — may not be present on a fresh install. See task: template drafter into domus.

## Doctor

Finds problems in the Domus store itself. Checks task/idea consistency between `tasks.jsonl`, `ideas.jsonl`, and their `.md` files; surfaces stuck in-progress tasks, orphaned files, dependency anomalies, drift. Reports findings clearly and asks what to do rather than silently fixing. The self-feedback loop — checks Domus's own data health, not the project's code.

**Implementation:** role file (`.domus/reference/staff/roles/doctor.md`).
