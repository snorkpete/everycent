class AccountBalancesController < ApplicationController
  before_action :authenticate_user!

  def index
    @bank_accounts = BankAccount.includes(:institution, :transactions)
                                .order(:account_category, :name)
                                .all
    respond_with(@bank_accounts, AccountBalanceSerializer)
  end
end
