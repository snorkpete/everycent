class SinkFundAllocationsController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  def index
    @sink_fund_allocations = SinkFundAllocation
                              .where(bank_account_id: params[:bank_account_id], status:'open')
    respond_with(@sink_fund_allocations, SinkFundAllocationSerializer)
  end
end
