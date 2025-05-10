class AddBroughtForwardStatusToTransaction < ActiveRecord::Migration[7.1]
  def change
    add_column :transactions, :brought_forward_status, :string
  end
end
