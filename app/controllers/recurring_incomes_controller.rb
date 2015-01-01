class RecurringIncomesController < ApplicationController
  before_action :set_recurring_income, only: [:show, :edit, :update, :destroy]

  def index
    @recurring_incomes = RecurringIncome.all
    respond_with(@recurring_incomes, RecurringIncomeSerializer)
  end

  def show
    respond_with(@recurring_income, RecurringIncomeSerializer)
  end

  def new
    @recurring_income = RecurringIncome.new
    respond_with(@recurring_income, RecurringIncomeSerializer)
  end

  def create
    @recurring_income = RecurringIncome.new(recurring_income_params)
    @recurring_income.save
    respond_with(@recurring_income, RecurringIncomeSerializer)
  end

  def update
    @recurring_income.update(recurring_income_params)
    respond_with(@recurring_income, RecurringIncomeSerializer)
  end

  def destroy
    @recurring_income.destroy
    respond_with(@recurring_income, RecurringIncomeSerializer)
  end

  private
    def set_recurring_income
      @recurring_income = RecurringIncome.find(params[:id])
    end

    def recurring_income_params
      params.fetch(:recurring_income, {}).permit(:name, :amount, :frequency, :bank_account_id)
    end
end
