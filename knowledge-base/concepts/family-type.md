---
type: concept
title: Family Type
term: family-type
definition: "Household setting (couple or single) that shapes the discretionary-money split and person-name display."
lexicon: true
description: >-
  How the couple/single family-type setting (stored in settings) shapes the
  system: for couples it splits the unallocated remainder equally for
  no-questions-asked discretionary spending, and it governs which person names
  are displayed.
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Family Type

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

For couples, the unallocated budget remainder is split equally between the two people for no-questions-asked [discretionary](/concepts/discretionary-money.md) spending. Person names (husband/wife or single_person) are stored in [settings](/tables/settings.md).

## Contract

- Values: `couple`, `single`.
- Stored in settings.
- Affects discretionary spending split and display of person names.
