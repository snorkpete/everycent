class AccountBalancesController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  def index
    @bank_accounts = BankAccount.includes(:institution, :transactions)
                                .order(:account_category, :name)
    @bank_accounts = @bank_accounts.where(status:'open') unless params[:include_closed] == 'true'
    respond_with(@bank_accounts, AccountBalanceSerializer)
  end
end
