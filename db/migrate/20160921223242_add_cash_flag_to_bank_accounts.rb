class AddCashFlagToBankAccounts < ActiveRecord::Migration[7.1]
  def change
    add_column :bank_accounts, :is_cash, :boolean, :default => true

    BankAccount.update_all is_cash: true
  end
end
