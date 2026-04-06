# Task: Transaction fingerprinting for dedup

**ID:** transaction-fingerprinting-for-dedup
**Status:** deferred
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-06
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Transactions currently use random manually-assigned IDs that carry no notion of real-world identity. Two records representing the same real-world transaction (same amount, date, payee/description) have no way to recognise each other. This makes dedup impossible without manual intervention.

Replace random IDs with fingerprint-based IDs derived from the transaction's core fields (amount + date + payee/description). The fingerprint gives every transaction a source-independent identity: the same real-world transaction produces the same fingerprint regardless of whether it arrives via web import, MCP transaction import, or future mobile offline sync.

Start early to iron out reliability (collision rates, edge cases like same-day same-amount transactions to the same payee) before this becomes load-bearing for mobile sync and MCP import.

---

## Acceptance Criteria

- [ ] Same real-world transaction produces the same fingerprint with acceptable error rate
- [ ] Manual random IDs replaced with fingerprint-based IDs
- [ ] Works for existing web import path (CSV/OFX upload)
- [ ] Designed to support future mobile offline sync and MCP transaction import paths
- [ ] Collision handling strategy defined for edge cases (e.g. same-day, same-amount, same-payee transactions)

---

## Implementation Notes

### Sources and fingerprint reliability (ideated 2026-04-06)

Three transaction sources, each with different description quality:
1. **Manual entry (phone or desktop)** — user-typed description ("groceries"). Least reliable for fingerprinting.
2. **Manual import** — copy-pasted bank descriptions from bank UI. Rich, bank-controlled vocabulary.
3. **File import** — bank-assigned IDs + bank-controlled descriptions. Most reliable identity. Also carries both trigger date and booking date.

Sources 2 and 3 share the same bank-controlled vocabulary — already used for allocation auto-assignment.

### Confidence scoring should be source-aware
- Two manual entries matching = lower confidence (descriptions are user-whim)
- Manual entry vs bank import = amount + date window match, but description unreliable — weight accordingly
- Two bank-sourced records matching = high confidence

### Temporal matching
Bank file imports carry two dates: trigger date (what the user thinks of) and booking date (when booked in system). Manual entries can be matched against *either* date, which narrows false positives significantly compared to a fixed date window.

### Strategy
Fingerprint + confidence score + flag for review. Don't auto-merge silently. High-confidence matches can be auto-suggested; low-confidence flagged on a review screen (especially relevant for mobile sync).
