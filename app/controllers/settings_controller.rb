class SettingsController < ApplicationController

  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  def index
    settings = Setting.as_hash
    render json: settings
  end

  def create
    Setting.primary_budget_account_id = params[:primary_budget_account_id]

    if params[:family_type] == 'single'
      Setting.update_family_type_to_single
      Setting.single_person = params[:single_person]
    else
      Setting.update_family_type_to_couple
      Setting.husband = params[:husband]
      Setting.wife = params[:wife]
    end

    render json: { success: true }
  end
end
