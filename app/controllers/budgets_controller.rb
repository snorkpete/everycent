class BudgetsController < ApplicationController
  include ParameterExtraction

  before_action :authenticate_user!
  before_action :set_budget, only: [:show, :edit, :update, :destroy]

  def index
    #@budgets = Budget.includes(:incomes, { allocations: [:allocation_category, :transactions] }).all
    @budgets = preloaded.all.order(start_date: :desc)
    respond_with(@budgets, BudgetSerializer)
  end

  def show
    respond_with(@budget, BudgetSerializer)
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
