class AddCamtImportedAndBankRefIndexToTransactions < ActiveRecord::Migration[7.1]
  def change
    add_column :transactions, :camt_imported, :boolean, default: false
    add_index :transactions, [:bank_account_id, :bank_ref], unique: true, name: "index_transactions_on_bank_account_id_and_bank_ref"
  end
end
