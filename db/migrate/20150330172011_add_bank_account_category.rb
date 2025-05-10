class AddBankAccountCategory < ActiveRecord::Migration[7.1]
  def change
    add_column :bank_accounts, :account_category, :string,
               default: 'asset'

    BankAccount.update_all account_category: 'asset'
  end
end
