class BudgetsController < ApplicationController
  include ParameterExtraction

  before_action :authenticate_user!
  before_action :set_budget, only: [:show, :edit, :update, :destroy]

  def index
    @budgets = Budget.all
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

  def update
    @budget.update(budget_params)

    income_params = extract_income_params(params)
    new_incomes = Income.update_from_params(income_params)
    @budget.incomes = new_incomes
    @budget.save

    respond_with(@budget, BudgetSerializer)
  end

  def destroy
    @budget.destroy
    respond_with(@budget, BudgetSerializer)
  end

  private
    def set_budget
      @budget = Budget.find(params[:id])
    end

    def budget_params
      params.fetch(:budget, {}).permit(:start_date, { incomes: [:name, :amount, :bank_account] } )
    end
end
