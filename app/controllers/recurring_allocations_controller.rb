class RecurringAllocationsController < ApplicationController
  before_action :set_recurring_allocation, only: [:show, :edit, :update, :destroy]

  def index
    @recurring_allocations = RecurringAllocation.includes(:allocation_category).all
    respond_with(@recurring_allocations, RecurringAllocationSerializer)
  end

  def show
    respond_with(@recurring_allocation, RecurringAllocationSerializer)
  end

  def new
    @recurring_allocation = RecurringAllocation.new
    respond_with(@recurring_allocation, RecurringAllocationSerializer)
  end

  def create
    @recurring_allocation = RecurringAllocation.new(recurring_allocation_params)
    @recurring_allocation.save
    respond_with(@recurring_allocation, RecurringAllocationSerializer)
  end

  def update
    @recurring_allocation.update(recurring_allocation_params)
    respond_with(@recurring_allocation, RecurringAllocationSerializer)
  end

  def destroy
    @recurring_allocation.destroy
    respond_with(@recurring_allocation, RecurringAllocationSerializer)
  end

  private
    def set_recurring_allocation
      @recurring_allocation = RecurringAllocation.find(params[:id])
    end

    def recurring_allocation_params
      params.fetch(:recurring_allocation, {}).permit(:name, :amount, :allocation_category_id, :frequency, :allocation_type, :is_standing_order, :bank_account_id)
    end
end
