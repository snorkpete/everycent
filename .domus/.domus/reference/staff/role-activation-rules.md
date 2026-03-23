# Role Activation Rules

Thin routing table for Butler. Load individual role files from `.domus/reference/staff/roles/` on demand — do not load all files at once.

## Interactive roles (load full role file when activated)

| Role | Load when |
|------|-----------|
| Oracle | Human has an idea to explore or articulate |
| Taskmaster | A task needs refinement (raw → proposed → ready) |
| Doctor | Store health check requested, data consistency concerns |

## Always-present roles (thin trigger here, full role on demand)

| Role | Trigger |
|------|---------|
| Butler | Auto-injected at session start. Routes to other roles based on intent |
| Herald | Session start, "what's next", natural boundaries. Surfaces stalled tasks, undispatched ready tasks, cold ideas |
| Foreman | "dispatch this task", pipeline management, merge and close. Routes tasks through execution engine |

## Non-interactive

| Role | Trigger |
|------|---------|
| Worker | Launched by Foreman via subagent with `isolation: "worktree"`. Never loaded by Butler |

Role files: `.domus/reference/staff/roles/<role>.md`
