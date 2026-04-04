# Design Philosophy

## Definition

Features come from observing real usage, not theoretical design. The system evolved empirically — most original intuitions about how budgeting should work turned out to be wrong.

## Context

After the initial setup, nearly every feature came from watching how the system was actually used — particularly by the user's wife. Key examples:

- **Copy budget** replaced the theoretically-designed recurring allocations because months were too similar to need templates.
- **Future budgets** came from observing spreadsheet usage for multi-month planning.
- **Annual transaction workarounds** (0.01 keep-alive, month suffix in names) were user-invented hacks that stuck because they worked.
- **Special events** exist to answer a real question: "how much did that vacation actually cost?"

The lesson: don't trust intuition about how budgeting "should" work. Watch how it's actually used. Most features that were designed upfront failed; most features that emerged from observation succeeded.

## Contract

- When considering new features, prefer observation over speculation.
- User workarounds that stick are signals of missing features.
- If a workaround works well enough, improving it shouldn't degrade the experience.
