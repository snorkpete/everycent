# Import (Transactions)

## Definition

Loading transactions into the system. Three methods: file import (CAMT), manual entry, and manual upload (copy-paste from bank portal).

## Context

**File import (CAMT)** — upload a bank statement file. Idempotent via transaction IDs from the bank file — re-uploading won't create duplicates. Limitation: ABN AMRO doesn't make the download available until end of day, so there's a lag if you want same-day transactions.

**Manual entry** — add rows directly in the transaction screen UI. Each gets a randomly generated ID.

**Manual upload (copy-paste)** — the primary method for a long time. Copy transactions from the bank's customer portal (standard browser copy), paste into a special field that parses the clipboard data into transactions. Also gets random IDs.

**Why IDs matter.** The transaction save process is destructive — wipe and replace for a bank account in a budget period. Random IDs on manual entries tell the system "these were manually added, preserve them during file import."

**Preview-then-save.** File import shows a preview before committing. User confirms before transactions are saved.

## Contract

- File import is idempotent (tracked by bank-issued transaction IDs).
- Manual entry and manual upload get random IDs to survive the wipe-and-replace save process.
- Import preview is a separate step from import save.
