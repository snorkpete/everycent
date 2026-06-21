# Idea: Extract buildSettingsStore and similar store factories for test setup

**Captured:** 2026-04-02
**Status:** abandoned

---

## The Idea

After mock-API migration lands, check if settingsStore/headingStore setup is repeated across page specs. If the 2-line pattern (mock API + flushPromises) appears 3+ times, extract a factory. settingsStore is special — router guard pre-loads it, so page tests might not need to set it up themselves.

---

## Why This Is Worth Doing

_To be filled in._

---

## Open Questions / Things to Explore

- _Add open questions here_
