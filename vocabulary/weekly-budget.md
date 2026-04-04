# Weekly Budget

**Status: Partial**

## Definition

Alternative view splitting a monthly budget into 5 weeks, distributing allocations proportionally by days in each week. Weighting = days in week / days in month.

## Context

**Intent.** Mid-month course correction — "I've spent 60% of my grocery budget but I'm only 2 weeks in, slow down." A reporting/self-correction tool for rationing spending across the month.

**Not fully implemented.** Development has been paused for months if not years. The concept and some backend logic exist but it's not a complete feature.

Related: cumulative allocations (allocations that distribute across weeks).

## Contract

- Splits month into 5 weeks.
- Weighting per week = days in that week / days in month.
- Cumulative allocations use this weighting to calculate amount_for_week and spent_for_week.
