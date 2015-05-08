class TransactionsController < ApplicationController
  before_action :authenticate_user!

  def index
    @transactions = Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id])
                               .includes(:allocation, { bank_account: :institution })
                               .order(:transaction_date)
    respond_with(@transactions, TransactionSerializer)
  end

  def by_allocation
    @transactions = Transaction.by_allocation(params[:allocation_id])
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
      :withdrawal_amount, :deposit_amount, :payee_id, :payee_code, :payee_name,
      :allocation_id, :sub_account_id])
  end
end
