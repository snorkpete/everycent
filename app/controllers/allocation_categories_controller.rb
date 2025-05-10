class AllocationCategoriesController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  before_action :set_allocation_category, only: [:show, :update, :destroy]

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

    def select_household
    end
end
