class AccountStatusesController < ApplicationController
  before_action :authenticate_user!

  def index
    @bank_accounts = BankAccount.includes(:institution, :transactions).all
    respond_with(@bank_accounts, AccountStatusSerializer)
  end
end
