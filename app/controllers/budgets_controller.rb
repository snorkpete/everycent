class BudgetsController < ApplicationController
  include ParameterExtraction

  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end
  before_action :set_budget, only: [:show, :update, :destroy]

  def index
    @budgets = Budget.all.order(start_date: :desc)
    respond_with(@budgets, SimpleBudgetSerializer)
  end

  def show
    respond_with(@budget, BudgetSerializer)
  end

  def current
    @budget = Budget.current
    render json: { budget_id: @budget.id }
  end

  def weekly
    @budget = Budget.current
    respond_with(@budget, WeeklyBudgetSerializer)
  end

  def future
    @budgets = Budget.future
    respond_with(@budgets, FutureBudgetSerializer)
  end

  def create
    @budget = Budget.new(budget_params)
    @budget.save
    respond_with(@budget, BudgetSerializer)
  end

  def copy
    result = Budget.copy(params[:id])
    respond_with(result, BudgetSerializer)
  end

  def close
    result = Budget.close(params[:id])
    respond_with(result, BudgetSerializer)
  end

  def reopen_last_budget
    result = Budget.reopen_last_budget
    respond_with(result, BudgetSerializer)
  end

  def update
    @budget.update(budget_params)

    income_params = extract_income_params(params)
    new_incomes = Income.update_from_params(income_params)
    @budget.incomes = new_incomes

    allocation_params = extract_allocation_params(params)
    new_allocations = Allocation.update_from_params(allocation_params)
    @budget.allocations = new_allocations

    @budget.save

    respond_with(@budget, BudgetSerializer)
  end

  def mass_update
    result = Budget.mass_update(params)
    if result
      render json: { success: true }
    else
      render json: { success: false }, status: 400
    end
  end

  def destroy
    @budget.destroy
    respond_with(@budget, BudgetSerializer)
  end

  private
    def set_budget
      @budget = preloaded.find(params[:id])
    end

    def preloaded
      Budget.includes({ incomes: :bank_account },
                      { allocations: [:bank_account,
                                      :allocation_category,
                                      :transactions] })
    end

    def budget_params
      params.fetch(:budget, {}).permit(:start_date, { incomes: [:name, :amount, :bank_account] } )
    end
end
