class RemoveSinkFundFlagFromBankAccount < ActiveRecord::Migration
  def change
    remove_column :bank_accounts, :is_sink_fund, :boolean
  end
end
