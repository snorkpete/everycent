class ImportPreviewService
  class ValidationError < StandardError; end

  def initialize(budget:, bank_accounts_params:)
    @budget = budget
    @bank_accounts_params = bank_accounts_params
  end

  def call
    {
      bank_accounts: @bank_accounts_params.map { |ba_params| process_bank_account(ba_params) }
    }
  end

  private

  def process_bank_account(ba_params)
    bank_account = BankAccount.find(ba_params[:bank_account_id])
    validate_iban!(bank_account, ba_params[:iban])

    transactions = (ba_params[:transactions] || []).map(&:to_h)
    validate_transactions!(transactions)

    check_duplicates!(bank_account, transactions)
    validate_period!(transactions)

    current_balance = bank_account.current_balance
    net = compute_net(transactions)
    projected_balance = current_balance + net

    {
      bank_account_id: bank_account.id,
      current_balance: current_balance,
      net: net,
      projected_balance: projected_balance,
      transactions: transactions
    }
  end

  def validate_iban!(bank_account, iban)
    return if iban.blank? && bank_account.account_no.blank?

    if normalize_iban(iban) != normalize_iban(bank_account.account_no)
      raise ValidationError, "IBAN mismatch for bank account #{bank_account.id}: expected #{bank_account.account_no}, got #{iban}"
    end
  end

  def normalize_iban(value)
    value.to_s.gsub(/\s/, '')
  end

  def validate_transactions!(transactions)
    transactions.each do |txn|
      date = begin
        Date.parse(txn[:transaction_date].to_s)
      rescue ArgumentError, TypeError
        nil
      end
      raise ValidationError, "Invalid transaction_date: #{txn[:transaction_date]}" if date.nil?

      withdrawal = txn[:withdrawal_amount].to_i
      deposit = txn[:deposit_amount].to_i
      raise ValidationError, "withdrawal_amount must be non-negative, got #{withdrawal}" if withdrawal < 0
      raise ValidationError, "deposit_amount must be non-negative, got #{deposit}" if deposit < 0
    end
  end

  def check_duplicates!(bank_account, transactions)
    existing_refs = Transaction.where(bank_account_id: bank_account.id)
                               .where.not(bank_ref: [nil, ""])
                               .pluck(:bank_ref)
                               .to_set

    transactions.each do |txn|
      if txn[:bank_ref].present? && existing_refs.include?(txn[:bank_ref])
        txn[:import_status] = "duplicate"
      end
    end
  end

  def validate_period!(transactions)
    budget_range = @budget.start_date..@budget.end_date

    transactions.each do |txn|
      next if txn[:import_status] == "duplicate"

      date = Date.parse(txn[:transaction_date].to_s)
      if budget_range.cover?(date)
        txn[:import_status] = "new"
      else
        txn[:import_status] = "out_of_period"
      end
    end
  end

  def compute_net(transactions)
    transactions
      .select { |txn| txn[:import_status] == "new" }
      .sum { |txn| txn[:deposit_amount].to_i - txn[:withdrawal_amount].to_i }
  end
end
