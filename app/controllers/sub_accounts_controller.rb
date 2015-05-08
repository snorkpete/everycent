class SubAccountsController < ApplicationController
  before_action :authenticate_user!

  def index
    @sub_accounts = SubAccount.where(bank_account_id: params[:bank_account_id])
    respond_with(@sub_accounts, SubAccountSerializer)
  end
end
