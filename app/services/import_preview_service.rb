class ImportPreviewService
  include ImportValidation

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

    ImportTransactionClassifier.new(
      budget: @budget,
      bank_account: bank_account,
      transactions: transactions
    ).call

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

  def compute_net(transactions)
    transactions
      .select { |txn| txn[:import_status] == "new" }
      .sum { |txn| txn[:deposit_amount].to_i - txn[:withdrawal_amount].to_i }
  end
end
