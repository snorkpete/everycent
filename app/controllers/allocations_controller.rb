class AllocationsController < ApplicationController
  before_action :authenticate_user!

  def index
    @allocations = Allocation.where(budget_id: params[:budget_id])
    respond_with(@allocations, AllocationSerializer)
  end
end
