# Task: Format money in MCP tool responses instead of returning raw cents

**ID:** format-money-in-mcp-tool-responses-instead-of-returning-raw-cents
**Status:** ready
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-06-07
**Parent:** none
**Depends on:** build-budget_accuracy-mcp-tool-nlq-tool-5
**Idea:** none
**Spec refs:** none

---

## What This Task Is

MCP NLQ tools currently return monetary values as raw integer cents with an `amount_unit: "cents (divide by 100...)"` note, forcing the LLM to do division to present figures to the user. That is error-prone (models slip on mechanical arithmetic) and contradicts the suite's "return finished numbers" philosophy — the tools already pre-sort, pre-filter, and pre-compute precisely so the model doesn't have to.

Fix: do the currency conversion in **code, at the Ruby response-shaping boundary** — not in the DB (the integer-cents invariant is load-bearing across the whole app; never divide in SQL) and not in TypeScript (`toolExecutor.ts` is a thin pass-through client; server is authoritative for formatting). Keep the exact integer `*_cents` field (for any reasoning the model still does) and add a pre-formatted `*_display` string the model can echo verbatim.

**Done = the model never performs currency arithmetic for display.**

### Decisions already made (do not re-litigate)

- **Both fields:** keep `*_cents` (exact integer), add `*_display` (formatted string). Do NOT replace cents with a float.
- **Symbol:** display strings include the € symbol, e.g. `"€1,234.56"`.
- **Negatives:** `"-€50.00"` (leading minus), matching the existing `centsToDollars` sign behaviour.
- **Nil:** `nil` cents → `"€0.00"`.
- **Approach C (explicit + enforced by shared spec)** chosen over convention-based auto-injection. Production code names every `*_display` field explicitly (greppable, no reflection magic); a shared RSpec example enforces the "every `*_cents` has a `*_display`" invariant as a loud test failure. Rationale: a visible convention that fails loudly when violated beats DRY magic that is hard to trace 6 months later.

---

## Acceptance Criteria

- [x] New helper `app/models/mcp/money.rb` with `Mcp::Money.display(cents)` returning a formatted string: `123456 → "€1,234.56"`, `-5000 → "-€50.00"`, `nil → "€0.00"`. Thousands separator + 2 decimals, € prefix. Format integer-based (no float division — see notes).
- [x] Every money-returning query object adds a `*_display` companion **explicitly** for each `*_cents` field it emits (Approach C — no auto-injection helper):
  - `Mcp::OverspendingAnalysis`
  - `Mcp::OverspendingAnalysisByAllocation`
  - `Mcp::BudgetAccuracy` (its money/cents fields — e.g. budgeted/actual totals over the range)
  - (`Mcp::CategoryList` / `ping` have no money fields — untouched.)
- [x] Shared RSpec example `spec/support/mcp_money_display.rb` — `"money fields have display companions"` — asserts that for every `*_cents` key in a tool's result rows there is a matching `*_display` key whose value equals `Mcp::Money.display(<cents>)`. Each money-returning query object's spec opts in via `include_examples`.
- [x] The `amount_unit: "cents (divide by 100 for currency display)"` controller note is replaced with one describing the two field kinds (e.g. `"*_cents = exact integer cents; *_display = ready-to-show currency string"`).
- [x] Each money-returning tool's description in `webclientv4/src/app/chat/toolDefinitions.ts` instructs the model to present monetary figures using the `*_display` fields (and that `*_cents` is for comparison/reasoning only).
- [x] `Mcp::Money` unit spec covering: positive, negative, zero, nil, sub-€1 (e.g. `7 → "€0.07"`), thousands boundary (e.g. `100000 → "€1,000.00"`), large value.
- [x] Existing query-object + controller specs extended to assert the new `*_display` fields are present and correct (in addition to the shared example).
- [x] Gates green: `bundle exec rspec`; in `webclientv4/`: `npm run type-check`, `npm run test`. No error suppression.

### Out of scope

- Non-money fields: percentages (`budget_accuracy` %-off), counts, ids — untouched.
- Any change to which figures the tools return or how they are computed — this is presentation only.
- Frontend display components (`EcMoneyDisplay`, `centsToDollars`) — unchanged; this is purely the MCP/LLM response contract.

---

## Implementation Notes

**Why this runs after `budget_accuracy` (the `depends-on`):** this is a cross-cutting sweep that must include `budget_accuracy`'s money fields. Running it before that tool lands on master would either miss those fields or conflict on the same files. Dispatch only after `build-budget_accuracy-mcp-tool-nlq-tool-5` is merged to master; branch the worktree off master at that point.

**Reference for formatting style:** the frontend `webclientv4/src/app/shared/util/centsToDollars.ts` produces `1,234.56` (thousands separator, 2 decimals, **no** symbol — templates add it). The MCP `*_display` field differs by including the € symbol, because the model emits prose with no template to add it.

**Format integer-based, not via float:** prefer `cents.abs.divmod(100)` + manual thousands grouping over `number_to_currency(cents / 100.0)` so no float ever enters. Sketch:

```ruby
module Mcp
  module Money
    def self.display(cents)
      cents ||= 0
      sign  = cents.negative? ? "-" : ""
      whole, frac = cents.abs.divmod(100)
      grouped = whole.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
      "#{sign}€#{grouped}.#{format('%02d', frac)}"
    end
  end
end
```

**Approach C call-site shape (explicit):**

```ruby
result.map do |row|
  budgeted  = row["budgeted_cents"].to_i
  actual    = row["actual_cents"].to_i
  remaining = row["amount_remaining_cents"].to_i
  {
    allocation:               row["allocation"],
    category_id:              row["category_id"].to_i,
    category:                 row["category"],
    budgeted_cents:           budgeted,
    budgeted_display:         Mcp::Money.display(budgeted),
    actual_cents:             actual,
    actual_display:           Mcp::Money.display(actual),
    amount_remaining_cents:   remaining,
    amount_remaining_display: Mcp::Money.display(remaining),
  }
end
```

**Shared enforcement example:**

```ruby
# spec/support/mcp_money_display.rb
RSpec.shared_examples "money fields have display companions" do
  it "pairs every *_cents field with a matching *_display string" do
    rows.each do |row|
      row.each_key do |key|
        next unless key.to_s.end_with?("_cents")
        display_key = :"#{key.to_s.delete_suffix('_cents')}_display"
        expect(row).to have_key(display_key), "missing #{display_key} for #{key}"
        expect(row[display_key]).to eq(Mcp::Money.display(row[key]))
      end
    end
  end
end
```

Each query-object spec sets `let(:rows) { ... results }` and `include_examples "money fields have display companions"`. Ensure `spec/support` files are required by `rails_helper` (check existing `spec/support` autoload config; the repo may need `Dir[Rails.root.join("spec/support/**/*.rb")].each { require _1 }` enabled — verify before assuming).

**Residual gap (accepted):** a new tool author must remember to add the `include_examples` line. Accepted trade-off — it's a one-time per-tool setup at creation. A meta-spec reflecting over all `Mcp::` query objects to force inclusion was considered and rejected as reintroducing reflection-magic to guard the anti-magic guard. Leave it; revisit only if a tool ships without it in practice.

**Commit scope:** single cohesive commit (helper + shared example + apply across all tools + spec updates + tool-description edits). Worker may split helper-introduction from application if the diff grows large, but one commit is expected.

**Sequencing:** fresh worktree off master (after budget_accuracy is merged). Stop at a reviewable commit; do not land/push.
