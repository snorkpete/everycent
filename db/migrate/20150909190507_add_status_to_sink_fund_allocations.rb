class AddStatusToSinkFundAllocations < ActiveRecord::Migration[7.1]
  def change
    add_column :sink_fund_allocations, :status, :string,
               index: true, default: 'open'

    SinkFundAllocation.update_all status: 'open'
  end
end
