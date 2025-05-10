class AddStatusToBankAccounts < ActiveRecord::Migration[7.1]
  def change
    add_column :bank_accounts, :status, :string, default: 'open'
    BankAccount.update_all status: 'open'
  end
end
