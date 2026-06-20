# Tracking registers

> **Why this bundle documents its own defects.** EveryCent was built as a functional tool for a two-person household, not a production product. With limited development time, the guiding stance was to treat the system as a whole and enforce each rule at the *cheapest sufficient place* for that context — sometimes in the UI (e.g. a transaction can't link both an allocation and a sink-fund allocation, enforced only in the form), sometimes by convention between two users who both know the rules (e.g. don't edit a closed budget's amounts), sometimes not at all where it doesn't bite at this scale (e.g. an N+1 on allocations that's invisible for two users). That's a deliberate trade, not an oversight — defense-in-depth on each individual piece wasn't worth the effort for the actual usage. These registers catalog those rough edges honestly, and they're being closed deliberately now that the app doubles as a production-practices learning ground and AI-assisted development makes the fixes cheap.

Maintenance state, not the live model. IDs (B/D/I/R/Q + number) are stable references.

* [Bugs & investigations](bugs.md) - known live defects (B)
* [Dead schema](dead-schema.md) - vestigial tables/columns (D)
* [Incomplete features](incomplete-features.md) - started, never finished (I)
* [Refactor candidates](refactor-candidates.md) - clarity improvements (R)
* [Open questions](open-questions.md) - unresolved threads (Q)
