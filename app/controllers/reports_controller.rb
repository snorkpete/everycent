class ReportsController < ApplicationController

  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  def net_worth
    result = Report.net_worth(current_household)
    render json: result
  end

  def category_spending
    result = Report.category_spending(current_household)
    render json: result
  end

  def needs_vs_wants
    result = Report.needs_vs_wants(current_household)
    render json: result
  end

end
