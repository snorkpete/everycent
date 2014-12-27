class AllocationCategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_allocation_category, only: [:show, :edit, :update, :destroy]

  respond_to :json

  def index
    @allocation_categories = AllocationCategory.all.order(:name)
    respond_with(@allocation_categories, AllocationCategorySerializer)
  end

  def show
    respond_with(@allocation_category, AllocationCategorySerializer)
  end

  def create
    @allocation_category = AllocationCategory.new(allocation_category_params)
    @allocation_category.save
    respond_with(@allocation_category, AllocationCategorySerializer)
  end

  def update
    @allocation_category.update(allocation_category_params)
    respond_with(@allocation_category, AllocationCategorySerializer)
  end

  def destroy
    @allocation_category.destroy
    respond_with(@allocation_category, AllocationCategorySerializer)
  end

  private
    def set_allocation_category
      @allocation_category = AllocationCategory.find(params[:id])
    end

    def allocation_category_params
      params.fetch(:allocation_category, {}).permit(:name, :percentage)
    end
end
