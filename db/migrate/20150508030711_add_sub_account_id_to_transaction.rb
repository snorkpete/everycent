class AddSubAccountIdToTransaction < ActiveRecord::Migration[7.1]
  def change
    add_column :transactions, :sub_account_id, :integer, index: true
  end
end
