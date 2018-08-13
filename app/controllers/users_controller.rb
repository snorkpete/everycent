class UsersController < ApplicationController
  # this class is about managing the list of users
  # It does NOT handle authentication
  # Authentication is managed by Devise
  # Currently, this logic is not being used
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end
  before_action :set_user, only: [:show, :edit, :update, :destroy]

  respond_to :json

  def index
    @users = User.all.order(:first_name)
    respond_with(@users, UserSerializer)
  end

  def show
    respond_with(@user, UserSerializer)
  end

  def create
    @user = User.new(user_params)
    @user.save
    respond_with(@user, UserSerializer)
  end

  def update
    @user.update(user_params)
    respond_with(@user, UserSerializer)
  end

  def destroy
    @user.destroy
    respond_with(@user, UserSerializer)
  end

  private
    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.fetch(:user, {}).permit(:first_name, :last_name)
    end
end
