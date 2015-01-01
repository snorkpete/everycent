require 'test_helper'

class RecurringIncomesControllerTest < ActionController::TestCase
  setup do
    @recurring_income = recurring_incomes(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:recurring_incomes)
  end

  test "should create recurring_income" do
    assert_difference('RecurringIncome.count') do
      post :create, recurring_income: { amount: @recurring_income.amount, bank_account_id: @recurring_income.bank_account_id, frequency: @recurring_income.frequency, name: @recurring_income.name }
    end

    assert_response 201
  end

  test "should show recurring_income" do
    get :show, id: @recurring_income
    assert_response :success
  end

  test "should update recurring_income" do
    put :update, id: @recurring_income, recurring_income: { amount: @recurring_income.amount, bank_account_id: @recurring_income.bank_account_id, frequency: @recurring_income.frequency, name: @recurring_income.name }
    assert_response 204
  end

  test "should destroy recurring_income" do
    assert_difference('RecurringIncome.count', -1) do
      delete :destroy, id: @recurring_income
    end

    assert_response 204
  end
end
