class AddAssetBankAccountIdToBankAccounts < ActiveRecord::Migration[7.1]
  def change
    add_column :bank_accounts, :asset_bank_account_id, :integer
    add_index :bank_accounts, :asset_bank_account_id
    add_foreign_key :bank_accounts, :bank_accounts, column: :asset_bank_account_id
  end
end
