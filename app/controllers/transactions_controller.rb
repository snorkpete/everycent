class TransactionsController < ApplicationController
  before_action :authenticate_user!

  def index
    @transactions = Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id]).order(:transaction_date)
    respond_with(@transactions, TransactionSerializer)
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
      :withdrawal_amount, :deposit_amount, :payee_id,
      :allocation_id])
  end
end
