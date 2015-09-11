class SinkFundsController < ApplicationController
  before_action :set_sink_fund, only: [:show, :edit, :update, :destroy]

  def index
    @sink_funds = BankAccount.sink_funds.includes(:institution, { :sink_fund_allocations => :transactions }).order(:name)
    @sink_funds = @sink_funds.where(status:'open') unless params[:include_closed] == 'true'
    respond_with(@sink_funds, SinkFundSerializer)
  end

  def update
    @sink_fund = BankAccount.update_sink_fund(params)
    respond_with(@sink_fund, SinkFundSerializer)
  end

  private
    def set_sink_fund
      @sink_fund = BankAccount.sink_funds.find(params[:id])
    end
end
