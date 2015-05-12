class AccountBalancesController < ApplicationController
  before_action :authenticate_user!

  def index
    @bank_accounts = BankAccount.includes(:institution, :transactions)
                                .order(:account_category, :name)
    @bank_accounts = @bank_accounts.where(status:'open') unless params[:include_closed] == 'true'
    respond_with(@bank_accounts, AccountBalanceSerializer)
  end
end
