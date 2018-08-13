class AllocationsController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  def index
    @allocations = Allocation.where(budget_id: params[:budget_id])
                            .includes(:bank_account, :allocation_category, :transactions)
    respond_with(@allocations, AllocationSerializer)
  end
end
