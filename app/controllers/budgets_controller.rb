class BudgetsController < ApplicationController
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
      params.fetch(:budget, {}).permit(:start_date)
    end
end
