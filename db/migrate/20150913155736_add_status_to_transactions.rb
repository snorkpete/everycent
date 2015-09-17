class AddStatusToTransactions < ActiveRecord::Migration
  def change
    add_column :transactions, :status, :string, index: true

    # default all transactions as paid
    Transaction.update_all status: 'paid'

    # for the current budget period, default credit card transactions as unpaid
    current_budget_start_date = Budget.current.start_date
    Transaction.where("transaction_date >= ?", current_budget_start_date)
               .where("bank_account_id in (select id from bank_accounts where account_type = 'credit_card')")
               .update_all(status: 'unpaid')
  end
end
