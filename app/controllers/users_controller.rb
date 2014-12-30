class UsersController < ApplicationController
  before_action :authenticate_user!
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
