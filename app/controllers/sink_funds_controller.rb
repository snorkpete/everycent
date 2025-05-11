class SinkFundsController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end
  before_action :set_sink_fund, only: [:show, :update, :transfer_allocation]

  def index
    @sink_funds = BankAccount.sink_funds.includes(:institution, { :sink_fund_allocations => :transactions }).order(:name)
    @sink_funds = @sink_funds.where(status:'open') unless params[:include_closed] == 'true'
    respond_with(@sink_funds, SinkFundSerializer)
  end

  def show
    @sink_fund = BankAccount.sink_funds.where(id: params[:id]).includes(:institution, { :sink_fund_allocations => :transactions }).first
    respond_with(@sink_fund, SinkFundSerializer)
  end

  def current
    @sink_fund = BankAccount.sink_funds.where(status: 'open').includes(:institution, { :sink_fund_allocations => :transactions }).order(:created_at).last
    respond_with(@sink_fund, SinkFundSerializer)
  end

  def update
    @sink_fund = BankAccount.update_sink_fund(params)
    respond_with(@sink_fund, SinkFundSerializer)
  end

  def transfer_allocation

    @sink_fund.transfer_allocation(
        params[:existing_allocation_id],
        params[:new_allocation_id],
        params[:amount])
    respond_with(@sink_fund, SinkFundSerializer)
  end

  private
    def set_sink_fund
      @sink_fund = BankAccount.sink_funds.find(params[:id])
    end
end
