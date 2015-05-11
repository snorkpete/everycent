class AddStatusToBankAccounts < ActiveRecord::Migration
  def change
    add_column :bank_accounts, :status, :string, default: 'open'
    BankAccount.update_all status: 'open'
  end
end
