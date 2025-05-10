class RemoveSinkFundFlagFromBankAccount < ActiveRecord::Migration[7.1]
  def change
    remove_column :bank_accounts, :is_sink_fund, :boolean
  end
end
