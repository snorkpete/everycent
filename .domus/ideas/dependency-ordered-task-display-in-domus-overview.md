# Idea: Dependency-Ordered Task Display in Domus Overview

**Date:** 2026-03-28

---

## The Idea

`domus task overview` currently groups tasks by status (Raw, Blocked, etc.) with no ordering within each group. Tasks with `--depends-on` relationships aren't reflected in the display order.

Change the display so that within each status category, tasks are shown in topological order based on their dependency chains. A task that blocks other tasks appears first; tasks that depend on it appear after. The ordering itself communicates "do this first, then this, then this."

This replaces the need for a separate "Blocked" section in most cases. If task B depends on task A, and both are in the same status category, B just shows up after A in the list — you don't need a separate bucket to tell you B is blocked.

The "Blocked" section would only remain for tasks blocked by something outside the current view (e.g., a task in another project, or a task owned by someone else). For a solo dev where everything is in one list, topological sort within categories probably replaces blocked entirely.

---

## Why This Is Worth Doing

- The current flat list within each category gives no guidance on what to tackle first
- Dependencies are already captured in task metadata (`--depends-on`) but not surfaced in the display
- For the audit tasks just created (34 tasks across 4 phases with explicit dependencies), the overview would be much more useful if it showed the execution order
- Removes cognitive load — you look at the list and the first item is what you should do next

---

## Open Questions / Things to Explore

- Should `domus task ready` also use topological ordering? It already filters to actionable tasks, but ordering within that set would help
- What happens with circular dependencies? (Probably just detect and warn)
- Should tasks with no dependencies float to the top or bottom within their group?
- Is there value in showing the dependency chain visually (indentation, tree lines) or is flat ordering enough?
- Should the Blocked section be removed entirely, or kept for cross-project/cross-owner blocks?
