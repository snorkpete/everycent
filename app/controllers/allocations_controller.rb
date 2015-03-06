class AllocationsController < ApplicationController
  before_action :authenticate_user!

  def index
    @allocations = Allocation.where(budget_id: params[:budget_id])
                            .includes(:bank_account, :allocation_category, :transactions)
    respond_with(@allocations, AllocationSerializer)
  end
end
