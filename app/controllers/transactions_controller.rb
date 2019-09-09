class TransactionsController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  def index
    @transactions = Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id])

    unless params[:no_bank_account]
      @transactions = @transactions.preloaded
    end

    @transactions = @transactions.order(:transaction_date)
    respond_with(@transactions, TransactionSerializer)
  end

  def by_allocation
    @transactions = Transaction.by_allocation(params[:allocation_id]).preloaded
                               .order(:transaction_date)
    respond_with(@transactions, TransactionSerializer)
  end

  def by_sink_fund_allocation
    @transactions = Transaction.by_sink_fund_allocation(params[:sink_fund_allocation_id]).preloaded
                               .order(:transaction_date).limit(25)
    respond_with(@transactions, TransactionSerializer)
  end

  def by_credit_card
    @transactions = Transaction.by_credit_card(params[:bank_account_id]).preloaded
                               .order(:transaction_date)
    respond_with(@transactions, TransactionSerializer)
  end

  def last_update
    @transaction = Transaction.order(transaction_date: :desc).first || Transaction.new( transaction_date: Date.today)
    respond_with(@transaction, TransactionSerializer)
  end

  def create
    @transactions = Transaction.update_with_params(transaction_params)
    respond_with(@transactions, TransactionSerializer)
  end

  def update_all
    @transactions = Transaction.update_with_params(transaction_params)
    respond_with(@transactions, TransactionSerializer)
  end

  protected
  def transaction_params
    params.permit(:budget_id, :bank_account_id, :transactions => [
      :id, :description, :bank_ref, :bank_account_id, :transaction_date,
      :withdrawal_amount, :deposit_amount,
      :allocation_id, :sink_fund_allocation_id, :status, :brought_forward_status])
  end
end
