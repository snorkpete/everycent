class DefaultAllocationsController < ApplicationController
  before_action :authenticate_user!

  def retrieve
    transaction_params = params[:transactions]
    budget_id = params[:budget_id]
    results = Payee.default_allocations(budget_id, transaction_params)
    respond_with(results, DefaultAllocationSerializer)
  end
end
