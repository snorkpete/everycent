class AddDefaultsToTransactionAmounts < ActiveRecord::Migration[5.2]
  def change
    change_column_default :transactions, :withdrawal_amount, from: nil, to: 0
    change_column_default :transactions, :deposit_amount, from: nil, to: 0
  end
end
