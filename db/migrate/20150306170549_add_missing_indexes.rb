class AddMissingIndexes < ActiveRecord::Migration[7.1]
  def change
    add_index :transactions, :allocation_id
    add_index :transactions, :bank_account_id
    add_index :transactions, :transaction_date
    add_index :budgets, :start_date
    add_index :recurring_incomes, :bank_account_id
    add_index :recurring_allocations, :allocation_category_id
    add_index :recurring_allocations, :bank_account_id
    add_index :incomes, :budget_id
    add_index :incomes, :bank_account_id
    add_index :bank_accounts, :user_id
    add_index :bank_accounts, :institution_id
    add_index :allocations, :budget_id
    add_index :allocations, :allocation_category_id
    add_index :allocations, :bank_account_id
  end
end
