class AddCashFlagToBankAccounts < ActiveRecord::Migration
  def change
    add_column :bank_accounts, :is_cash, :boolean, :default => true

    BankAccount.update_all is_cash: true
  end
end
