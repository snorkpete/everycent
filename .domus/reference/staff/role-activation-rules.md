# Role Activation Rules

Thin routing table for Butler. See `staff.md` for the full registry of what roles exist. This file only covers how Butler activates them on demand.

Roles implemented as skills (e.g. Oracle) self-activate via Claude Code's built-in skill logic and are not listed here.

## Interactive roles (load full role file when activated)

| Role | Load when |
|------|-----------|
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
