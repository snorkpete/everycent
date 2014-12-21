require 'test_helper'

class InstitutionsControllerTest < ActionController::TestCase
  setup do
    @institution = institutions(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:institutions)
  end

  test "should create institution" do
    assert_difference('Institution.count') do
      post :create, institution: { name: @institution.name }
    end

    assert_response 201
  end

  test "should show institution" do
    get :show, id: @institution
    assert_response :success
  end

  test "should update institution" do
    put :update, id: @institution, institution: { name: @institution.name }
    assert_response 204
  end

  test "should destroy institution" do
    assert_difference('Institution.count', -1) do
      delete :destroy, id: @institution
    end

    assert_response 204
  end
end
