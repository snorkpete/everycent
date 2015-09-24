class SinkFundAllocationsController < ApplicationController
  before_action :authenticate_user!

  def index
    @sink_fund_allocations = SinkFundAllocation
                              .where(bank_account_id: params[:bank_account_id], status:'open')
    respond_with(@sink_fund_allocations, SinkFundAllocationSerializer)
  end
end
