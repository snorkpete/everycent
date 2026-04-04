# Special Event

## Definition

A named event (e.g., vacation, renovation) with a budget estimate and actual amount. Allocations can link to it to track event-specific spending across multiple budgets.

## Context

**Primarily a retrospective tool.** While there's an estimate component, the main value is understanding the real cost of past events — particularly vacations — so future events can be planned with real data rather than guesswork. It's backward-looking analysis to inform forward-looking planning.

Allocations link to a special event via `special_event_id`, which lets spending be aggregated across multiple budget periods for events that span months.

## Contract

- Has a name, budget_amount (estimate), actual_amount, and start_date.
- Allocations optionally link to a special event.
- Used in reports to compare estimated vs actual event cost.
