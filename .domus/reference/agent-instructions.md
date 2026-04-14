# Domus — Workflow Instructions

## Before creating a task

Always check the existing task list before creating a new task. Run `domus task list` or scan `.domus/tasks/` to avoid duplicates — including cancelled tasks, which may be worth reopening rather than recreating.

## Task file editing rules

Task markdown files have two distinct parts — use the right tool for each:

- **Metadata fields** (frontmatter: status, autonomous, priority, depends-on, etc.) — always update via `domus task update <id> --field value`. This keeps `tasks.jsonl` in sync. Direct file edits to frontmatter will silently diverge from the index and break `domus task overview` and other commands.
- **Status transitions** — use `domus task advance <id>` for normal forward progression. Use `domus task cancel`, `domus task defer`, `domus task reopen` for escape hatches. `domus task status` is a Doctor power tool only.
- **Body content** (description, acceptance criteria, implementation notes) — edit the markdown file directly with Write/Edit tools. The CLI has no flags for body content.

## Task status lifecycle

```
raw → proposed → ready → in-progress → done
```

- **raw** (`○`) — just captured, needs refinement
- **proposed** (`◐`) — Claude has done a refinement pass (criteria written, shape clear) but the human hasn't reviewed yet
- **ready** (`◎`) — human approved, waiting for dispatch
- **in-progress** (`◑`) — being worked on
- **done** (`●`) — complete

Escape hatches from any state: `cancelled` (`✕`), `deferred` (`⏸`). Re-entry: `reopen` returns to `raw`.

`ready-for-senior-review` (`⊙`) exists in the state engine but is skipped by `advance` in v0.0. Known v0.1 addition.

### The `autonomous` flag

Boolean on each task, always present in frontmatter (`**Autonomous:** true` or `**Autonomous:** false`). Controls whether the task can be dispatched to a Worker for autonomous execution. Set via `domus task update <id> --autonomous` or `--no-autonomous`.

### CLI commands for status transitions

- `domus task advance <id>` — primary forward transition. The state engine decides the next status.
- `domus task cancel <id> [--note <text>]` — cancel from any active state
- `domus task defer <id> [--note <text>]` — defer from any active state
- `domus task reopen <id>` — reopen cancelled/deferred → raw
- `domus task status <id> <value>` — Doctor power tool only, not for normal workflow. Only use this when fixing data consistency issues (e.g. a task stuck in the wrong status). All normal workflow goes through the commands above.

### The `--root` flag

When running in a worktree or targeting a different project's store, use `--root <path>` on all domus commands. Never set the `DOMUS_ROOT` environment variable directly — it is an internal mechanism used by `cli.ts` after parsing `--root`.

```
domus --root /path/to/main-repo task log <id> "message"
```

## Task overview grouping

Overview groups tasks by status in this order:
1. **Ready** — can be dispatched
2. **In Progress** — currently being worked on
3. **Proposed** — needs human review
4. **Raw** — needs refinement
5. **Blocked** — unmet dependencies

**`task add` and `task update` flags must mirror each other.** When a flag is added to one command, add it to the other in the same commit.

**Superseded tasks must be cancelled immediately.** If a task is superseded by another piece of work, cancel it (`domus task cancel <id> --note "reason"`) at the same time as writing any outcome note.

## Ideas vs tasks

An **idea** is for exploring unknowns — "is this worth pursuing?" or "what are we even talking about?" Ideas are concepts under development. A task forms from an idea once it's clear something will be implemented.

A **task** is for known implementation work. Even if details need refinement, the direction is decided.

When in doubt: if you don't know whether something will be built, it's an idea. If you know it will, it's a task.

## Dispatching a task to a Worker

When the user says "dispatch", "run the worker on X", "dispatch this task", or similar:

1. Run `domus dispatch <task-id>` — this transitions the task to `in-progress` and creates the execution log
2. Launch a Worker subagent via the Agent tool with `subagent_type: "general-purpose"`, `isolation: "worktree"`, `run_in_background: true`
3. Pass the task ID, main repo path, and instruct it to read its role file at `.domus/reference/staff/roles/worker.md`

Only dispatch tasks that are `ready` status. If the task is not ready, advance it first or ask the user.

After dispatch, the Foreman manages the review cycle (dispatch, supervision, advancement). Do not merge worker output without user approval — when the human approves, Housekeeper handles the landing step. See `.domus/reference/staff/roles/foreman.md` for the dispatch protocol and the `housekeeper` skill for merge/close-out.

## Updating the base branch config

Run `domus config set-branch [<branch>]` when the user explicitly mentions the domus branch config — e.g. "set the domus branch", "update the domus branch config", "change the domus base branch". If no branch is given, the current git branch is detected automatically. Do not trigger on generic git branch mentions.

## Further reading (load when needed)

- `docs/cli-reference.md` — read when using the domus CLI directly (command syntax, flags)
- `decisions/000-vision.md` — read when scoping new features or when the right direction feels unclear
- `decisions/003-personas-vs-skills.md` — read when working with the Domus staff and roles (Butler, Oracle, Worker, etc.)
- `decisions/004-domus-store-and-worker-logging.md` — read when working with autonomous dispatch, worktrees, or execution logs
