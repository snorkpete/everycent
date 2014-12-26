require 'test_helper'

class ExpenseCategoriesControllerTest < ActionController::TestCase
  setup do
    @expense_category = expense_categories(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:expense_categories)
  end

  test "should create expense_category" do
    assert_difference('ExpenseCategory.count') do
      post :create, expense_category: { name: @expense_category.name, percentage: @expense_category.percentage }
    end

    assert_response 201
  end

  test "should show expense_category" do
    get :show, id: @expense_category
    assert_response :success
  end

  test "should update expense_category" do
    put :update, id: @expense_category, expense_category: { name: @expense_category.name, percentage: @expense_category.percentage }
    assert_response 204
  end

  test "should destroy expense_category" do
    assert_difference('ExpenseCategory.count', -1) do
      delete :destroy, id: @expense_category
    end

    assert_response 204
  end
end
