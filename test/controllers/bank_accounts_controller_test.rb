require 'test_helper'

class BankAccountsControllerTest < ActionController::TestCase
  setup do
    @bank_account = bank_accounts(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:bank_accounts)
  end

  test "should create bank_account" do
    assert_difference('BankAccount.count') do
      post :create, bank_account: { account_no: @bank_account.account_no, current_balance: @bank_account.current_balance, institution_id: @bank_account.institution_id, nickname: @bank_account.nickname, opening_balance: @bank_account.opening_balance, type: @bank_account.type, user_id: @bank_account.user_id }
    end

    assert_response 201
  end

  test "should show bank_account" do
    get :show, id: @bank_account
    assert_response :success
  end

  test "should update bank_account" do
    put :update, id: @bank_account, bank_account: { account_no: @bank_account.account_no, current_balance: @bank_account.current_balance, institution_id: @bank_account.institution_id, nickname: @bank_account.nickname, opening_balance: @bank_account.opening_balance, type: @bank_account.type, user_id: @bank_account.user_id }
    assert_response 204
  end

  test "should destroy bank_account" do
    assert_difference('BankAccount.count', -1) do
      delete :destroy, id: @bank_account
    end

    assert_response 204
  end
end
