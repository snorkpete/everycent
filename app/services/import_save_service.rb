class ImportSaveService
  class ValidationError < StandardError; end

  PERMITTED_FIELDS = %i[
    transaction_date description withdrawal_amount deposit_amount bank_ref status allocation_id
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
    saved_count = 0

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
      saved_count += 1
    end

    build_response(bank_account, saved_count).merge(skipped: skipped)
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
    camt_imported = txn_params.key?(:camt_imported) ? ActiveModel::Type::Boolean.new.cast(txn_params[:camt_imported]) : true
    Transaction.create!(
      permitted.merge(
        bank_account_id: bank_account.id,
        camt_imported: camt_imported
      )
    )
  end

  def build_response(bank_account, saved_count)
    current_balance = bank_account.reload.current_balance

    {
      bank_account_id: bank_account.id,
      current_balance: current_balance,
      net: 0,
      projected_balance: current_balance,
      saved_count: saved_count
    }
  end

end
