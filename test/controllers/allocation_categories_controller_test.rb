require 'test_helper'

class AllocationCategoriesControllerTest < ActionController::TestCase
  setup do
    @allocation_category = allocation_categories(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:allocation_categories)
  end

  test "should create allocation_category" do
    assert_difference('AllocationCategory.count') do
      post :create, allocation_category: { name: @allocation_category.name, percentage: @allocation_category.percentage }
    end

    assert_response 201
  end

  test "should show allocation_category" do
    get :show, id: @allocation_category
    assert_response :success
  end

  test "should update allocation_category" do
    put :update, id: @allocation_category, allocation_category: { name: @allocation_category.name, percentage: @allocation_category.percentage }
    assert_response 204
  end

  test "should destroy allocation_category" do
    assert_difference('AllocationCategory.count', -1) do
      delete :destroy, id: @allocation_category
    end

    assert_response 204
  end
end
