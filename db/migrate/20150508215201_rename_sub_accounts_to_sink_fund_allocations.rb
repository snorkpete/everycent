class RenameSubAccountsToSinkFundAllocations < ActiveRecord::Migration[7.1]
  def change
    rename_table :sub_accounts, :sink_fund_allocations
    rename_column :transactions, :sub_account_id, :sink_fund_allocation_id
  end
end
