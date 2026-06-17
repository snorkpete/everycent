# Backfills `transactions.payee_name` for one household.
#
# Only considers rows where `payee_name IS NULL` (idempotent). Whether a row
# is an internal transfer / bookkeeping movement is determined entirely by
# PayeeTransferDetector — this class does not re-implement that logic.
#
# Per candidate row:
#   - PayeeTransferDetector.transfer? → leave NULL, count :cleared
#   - otherwise pass to PayeeNameExtractor:
#       - non-nil result → write payee_name (unless dry_run), count :named
#       - nil result     → leave NULL, count :no_extractor
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
          if PayeeTransferDetector.transfer?(txn)
            counts[:cleared] += 1
            next
          end

          # `bank_account` may be nil for a small number of historical rows with
          # a dangling bank_account_id. `&.import_format` returns nil, which
          # PayeeNameExtractor treats as an unregistered format → nil → :no_extractor.
          name = PayeeNameExtractor.extract(
            description:   txn.description,
            import_format: txn.bank_account&.import_format
          )

          if name
            # update_columns intentionally bypasses callbacks/validations and
            # leaves updated_at untouched — this is a one-off embedding backfill,
            # not a meaningful change to the row.
            txn.update_columns(payee_name: name) unless @dry_run
            counts[:named] += 1
          else
            counts[:no_extractor] += 1
          end
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
