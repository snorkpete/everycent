# Brought Forward

## Definition

Credit card mechanism. Unpaid transactions from one budget period are copied into the next with a "(B/F)" suffix. A balancing transaction is added to make the maths work. The originals are marked as paid.

## Context

The goal with credit card charges is to pay them off without incurring interest. Sometimes there's flexibility (don't always have to pay to zero). The paid/unpaid markers help track which charges are intended to be cleared this period.

This is "useful fiction" — the credit card company doesn't track payments against specific charges. But as a personal budgeting tool, it's valuable for planning which charges to clear.

**The balancing transaction** is important — without it, the brought-forward transactions would appear as new spending that doesn't actually exist in the new budget period.

## Contract

- Triggered by budget close for credit card accounts.
- Unpaid transactions are copied to the new period with "(B/F)" description suffix.
- A total brought-forward balancing transaction is created.
- Original transactions are marked as paid.
- `brought_forward_status` values: `brought_forward`, `added`, `adjustment`.
