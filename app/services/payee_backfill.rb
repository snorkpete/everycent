# Backfills `transactions.payee_name` for one household.
#
# Only considers rows where `payee_name IS NULL` (idempotent). The decision of
# whether a row is an internal transfer / bookkeeping movement and what payee
# name to assign is delegated entirely to PayeeNameResolver — this class does
# not re-implement that logic.
#
# Per candidate row (via PayeeNameResolver):
#   - :cleared      → leave NULL, count :cleared
#   - :named        → write payee_name (unless dry_run), count :named
#   - :no_extractor → leave NULL, count :no_extractor
#
# Usage:
#   result = PayeeBackfill.new(household_id: 96).call          # dry run (default)
#   result = PayeeBackfill.new(household_id: 96, dry_run: false).call
#
# Returns a summary hash:
#   { household_id:, considered:, named:, cleared:, no_extractor: }
class PayeeBackfill
  def initialize(household_id:, dry_run: true)
    @household_id = household_id
    @dry_run      = dry_run
  end

  def call
    household = Household.find(@household_id)

    counts = { named: 0, cleared: 0, no_extractor: 0 }

    ActsAsTenant.with_tenant(household) do
      candidates.in_batches do |batch|
        batch.each do |txn|
          outcome, name = PayeeNameResolver.call(txn)
          counts[outcome] += 1

          # update_columns intentionally bypasses callbacks/validations and
          # leaves updated_at untouched — this is a one-off embedding backfill,
          # not a meaningful change to the row.
          txn.update_columns(payee_name: name) if outcome == :named && !@dry_run
        end
      end
    end

    {
      household_id:  @household_id,
      considered:    counts.values.sum,
      named:         counts[:named],
      cleared:       counts[:cleared],
      no_extractor:  counts[:no_extractor],
    }
  end

  private

  # Only rows with NULL payee_name — never overwrite existing values.
  # Ordered by id for consistent, predictable processing (useful for operational
  # monitoring and re-running after a partial failure).
  def candidates
    Transaction
      .where(payee_name: nil)
      .includes(:bank_account)
      .order(:id)
  end
end
