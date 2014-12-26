class ExpenseCategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_expense_category, only: [:show, :edit, :update, :destroy]

  respond_to :json

  def index
    @expense_categories = ExpenseCategory.all
    respond_with(@expense_categories, ExpenseCategorySerializer)
  end

  def show
    respond_with(@expense_category, ExpenseCategorySerializer)
  end

  def create
    @expense_category = ExpenseCategory.new(expense_category_params)
    @expense_category.save
    respond_with(@expense_category, ExpenseCategorySerializer)
  end

  def update
    @expense_category.update(expense_category_params)
    respond_with(@expense_category, ExpenseCategorySerializer)
  end

  def destroy
    @expense_category.destroy
    respond_with(@expense_category, ExpenseCategorySerializer)
  end

  private
    def set_expense_category
      @expense_category = ExpenseCategory.find(params[:id])
    end

    def expense_category_params
      params.require(:expense_category).permit(:name, :percentage)
    end
end
