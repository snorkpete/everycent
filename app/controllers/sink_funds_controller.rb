class SinkFundsController < ApplicationController
  before_action :set_sink_fund, only: [:show, :edit, :update, :destroy]

  def index
    @sink_funds = BankAccount.sink_funds.includes(:institution, :sub_accounts).order(:name).all
    respond_with(@sink_funds, SinkFundSerializer)
  end

  def update
    @bank_account.update(bank_account_params)
    respond_with(@bank_account, SinkFundSerializer)
  end

  private
    def set_sink_fund
      @sink_fund = BankAccount.sink_funds.find(params[:id])
    end

    def sink_fund_params
      params.fetch(:sink_fund, {}).permit({ sub_accounts: [:name, :amount, :bank_account] )
    end
end
