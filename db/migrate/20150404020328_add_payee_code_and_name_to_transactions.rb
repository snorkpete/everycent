class AddPayeeCodeAndNameToTransactions < ActiveRecord::Migration[7.1]
  def change
    add_column :transactions, :payee_code, :string, index: true
    add_column :transactions, :payee_name, :string
  end
end
