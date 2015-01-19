class TransactionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_budget, only: [:show, :edit, :update, :destroy]

  def index
    @transactions = Transaction.where('transaction_date between ? and ?',
                                      params[:start_date], params[:end_date])
    respond_with(@transactions, TransactionSerializer)
  end

  def create
    Transaction.update_with_params(transaction_params)
  end

  protected
  def transaction_params
    params.permit(:transactions => [
      :description, :bank_ref, :bank_account_id, :transaction_date,
      :withdrawal_amount, :deposit_amount, :payee_id,
      :allocation_id]).require(:transactions)
  end
end
