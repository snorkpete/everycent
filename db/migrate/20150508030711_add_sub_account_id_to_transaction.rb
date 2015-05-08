class AddSubAccountIdToTransaction < ActiveRecord::Migration
  def change
    add_column :transactions, :sub_account_id, :integer, index: true
  end
end
