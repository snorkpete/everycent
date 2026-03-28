# Classifies imported transactions for both preview and save flows.
#
# Takes a list of transaction hashes and returns each one annotated with
# an `import_status`: new, duplicate, out_of_period, invalid_date, or user_excluded.
#
# Callers decide what to do with each classification:
#   - Preview: sends everything back to the UI for display
#   - Save: persists only "new" transactions, reports the rest as skipped
#
# Raises ImportValidation::ValidationError only for fatal, account-level problems
# (e.g. IBAN mismatch). Individual transaction issues are classifications, not errors.
class ImportTransactionClassifier
  def initialize(budget:, bank_account:, transactions:)
    @budget = budget
    @bank_account = bank_account
    @transactions = transactions
    @existing_refs = load_existing_refs
  end

  def call
    @transactions.each do |txn|
      txn[:import_status] = classify(txn)
    end

    @transactions
  end

  private

  def classify(txn)
    return "user_excluded" if user_excluded?(txn)
    return "duplicate" if duplicate?(txn)
    return "invalid_amounts" if invalid_amounts?(txn)

    date = parse_date(txn[:transaction_date])
    return "invalid_date" if date.nil?
    return "out_of_period" unless budget_range.cover?(date)

    "new"
  end

  def user_excluded?(txn)
    ActiveModel::Type::Boolean.new.cast(txn[:deleted])
  end

  def duplicate?(txn)
    txn[:bank_ref].present? && @existing_refs.include?(txn[:bank_ref])
  end

  def invalid_amounts?(txn)
    withdrawal = txn[:withdrawal_amount].to_i
    deposit = txn[:deposit_amount].to_i
    withdrawal < 0 || deposit < 0 || (withdrawal > 0 && deposit > 0)
  end

  def parse_date(value)
    Date.parse(value.to_s)
  rescue ArgumentError, TypeError
    nil
  end

  def budget_range
    @budget_range ||= @budget.start_date..@budget.end_date
  end

  def load_existing_refs
    Transaction.where(bank_account_id: @bank_account.id)
               .where.not(bank_ref: [nil, ""])
               .pluck(:bank_ref)
               .to_set
  end
end
