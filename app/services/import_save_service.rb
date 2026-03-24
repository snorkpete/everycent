class ImportSaveService
  class ValidationError < StandardError; end

  PERMITTED_FIELDS = %i[
    transaction_date description withdrawal_amount deposit_amount bank_ref status
  ].freeze

  def initialize(budget:, bank_accounts_params:)
    @budget = budget
    @bank_accounts_params = bank_accounts_params
  end

  def call
    results = []

    ActiveRecord::Base.transaction do
      @bank_accounts_params.each do |ba_params|
        results << process_bank_account(ba_params)
      end
    end

    { bank_accounts: results }
  end

  private

  def process_bank_account(ba_params)
    bank_account = BankAccount.find(ba_params[:bank_account_id])
    validate_iban!(bank_account, ba_params[:iban])

    transactions_params = (ba_params[:transactions] || []).map(&:to_h)
    existing_refs = load_existing_refs(bank_account)
    skipped = []

    transactions_params.each do |txn_params|
      if ActiveModel::Type::Boolean.new.cast(txn_params[:deleted])
        skipped << { bank_ref: txn_params[:bank_ref], reason: "user_excluded" }
        next
      end

      if duplicate?(txn_params, existing_refs)
        skipped << { bank_ref: txn_params[:bank_ref], reason: "duplicate" }
        next
      end

      period_status = budget_period_status(txn_params)
      unless period_status == :in_period
        skipped << { bank_ref: txn_params[:bank_ref], reason: period_status.to_s }
        next
      end

      create_transaction!(bank_account, txn_params)
    end

    build_response(bank_account).merge(skipped: skipped)
  end

  def validate_iban!(bank_account, iban)
    return if iban.blank? && bank_account.account_no.blank?

    if normalize_iban(iban) != normalize_iban(bank_account.account_no)
      raise ValidationError,
            "IBAN mismatch for bank account #{bank_account.id}: expected #{bank_account.account_no}, got #{iban}"
    end
  end

  def normalize_iban(value)
    value.to_s.gsub(/\s/, '')
  end

  def load_existing_refs(bank_account)
    Transaction.where(bank_account_id: bank_account.id)
               .where.not(bank_ref: [nil, ""])
               .pluck(:bank_ref)
               .to_set
  end

  def duplicate?(txn_params, existing_refs)
    txn_params[:bank_ref].present? && existing_refs.include?(txn_params[:bank_ref])
  end

  def budget_period_status(txn_params)
    date = begin
      Date.parse(txn_params[:transaction_date].to_s)
    rescue ArgumentError, TypeError
      return :invalid_date
    end

    budget_range = @budget.start_date..@budget.end_date
    budget_range.cover?(date) ? :in_period : :out_of_period
  end

  def create_transaction!(bank_account, txn_params)
    permitted = txn_params.slice(*PERMITTED_FIELDS)
    Transaction.create!(
      permitted.merge(
        bank_account_id: bank_account.id,
        camt_imported: true
      )
    )
  end

  def build_response(bank_account)
    budget_range = @budget.start_date..@budget.end_date
    all_transactions = Transaction.where(bank_account_id: bank_account.id)
                                  .where(transaction_date: budget_range)
                                  .order(:transaction_date)

    current_balance = bank_account.reload.current_balance

    {
      bank_account_id: bank_account.id,
      current_balance: current_balance,
      net: 0,
      projected_balance: current_balance,
      transactions: all_transactions.map { |txn| serialize_transaction(txn) }
    }
  end

  def serialize_transaction(txn)
    {
      id: txn.id,
      description: txn.description,
      bank_ref: txn.bank_ref,
      bank_account_id: txn.bank_account_id,
      transaction_date: txn.transaction_date,
      withdrawal_amount: txn.withdrawal_amount,
      deposit_amount: txn.deposit_amount,
      allocation_id: txn.allocation_id,
      sink_fund_allocation_id: txn.sink_fund_allocation_id,
      status: txn.status,
      paid: txn.paid,
      net_amount: txn.net_amount,
      brought_forward_status: txn.brought_forward_status,
      camt_imported: txn.camt_imported
    }
  end
end
