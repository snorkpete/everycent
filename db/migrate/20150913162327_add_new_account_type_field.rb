class AddNewAccountTypeField < ActiveRecord::Migration
  def change
    rename_column :bank_accounts, :account_type, :account_type_description
    add_column :bank_accounts, :account_type, :string, :default => 'normal'
               
    BankAccount.update_all account_type: 'normal'
  end
end
