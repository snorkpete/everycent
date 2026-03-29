class ImportSaveService
  include ImportValidation

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

    transactions = (ba_params[:transactions] || []).map(&:to_h)

    ImportTransactionClassifier.new(
      budget: @budget,
      bank_account: bank_account,
      transactions: transactions
    ).call

    saved_count = 0
    skipped = []

    transactions.each do |txn|
      if txn[:import_status] == "new"
        create_transaction!(bank_account, txn)
        saved_count += 1
      else
        skipped << { bank_ref: txn[:bank_ref], reason: txn[:import_status] }
      end
    end

    current_balance = bank_account.reload.current_balance

    {
      bank_account_id: bank_account.id,
      current_balance: current_balance,
      net: 0,
      projected_balance: current_balance,
      saved_count: saved_count,
      skipped: skipped,
      transactions: load_budget_transactions(bank_account)
    }
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

  def load_budget_transactions(bank_account)
    Transaction.where(bank_account_id: bank_account.id)
               .where(transaction_date: @budget.start_date..@budget.end_date)
               .order(:transaction_date)
               .map { |t| transaction_to_hash(t) }
  end

  def transaction_to_hash(txn)
    {
      id: txn.id,
      transaction_date: txn.transaction_date,
      description: txn.description,
      withdrawal_amount: txn.withdrawal_amount,
      deposit_amount: txn.deposit_amount,
      bank_ref: txn.bank_ref,
      status: txn.status,
      allocation_id: txn.allocation_id,
      camt_imported: txn.camt_imported
    }
  end
end
