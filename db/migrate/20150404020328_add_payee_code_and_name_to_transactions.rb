class AddPayeeCodeAndNameToTransactions < ActiveRecord::Migration
  def change
    add_column :transactions, :payee_code, :string, index: true
    add_column :transactions, :payee_name, :string
  end
end
