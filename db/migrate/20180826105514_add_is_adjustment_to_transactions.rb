class AddIsAdjustmentToTransactions < ActiveRecord::Migration[5.2]
  def change
    add_column :transactions, :is_manual_adjustment, :boolean, default: false
  end
end
