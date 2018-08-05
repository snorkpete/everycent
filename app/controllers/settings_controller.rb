class SettingsController < ApplicationController

  before_action :authenticate_user!

  def index
    settings = Setting.as_hash
    render json: settings
  end

  def create
    Setting.primary_budget_account_id = params[:primary_budget_account_id]
    Setting.husband = params[:husband]
    Setting.wife = params[:wife]
    render json: { success: true }
  end
end
