class AddBroughtForwardStatusToTransaction < ActiveRecord::Migration
  def change
    add_column :transactions, :brought_forward_status, :string
  end
end
