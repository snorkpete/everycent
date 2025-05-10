class AddDefaultAllocationFlagToBankAccounts < ActiveRecord::Migration[7.1]
  def change
    add_column :bank_accounts, :allow_default_allocations, :boolean, default: false

    BankAccount.update_all allow_default_allocations: false
  end
end
