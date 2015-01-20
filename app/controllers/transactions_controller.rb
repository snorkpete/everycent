class TransactionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_budget, only: [:show, :edit, :update, :destroy]

  def index
    @transactions = Transaction.for_period(params[:start_date],
                                           params[:end_date],
                                           params[:bank_account_id])
                               .order(:transaction_date)

    respond_with(@transactions, TransactionSerializer)
  end

  def update_all
    @transactions = Transaction.update_with_params(transaction_params)
    respond_with(@transactions, TransactionSerializer)
  end

  protected
  def transaction_params
    params.permit(:start_date, :end_date, :transactions => [
      :id, :description, :bank_ref, :bank_account_id, :transaction_date,
      :withdrawal_amount, :deposit_amount, :payee_id,
      :allocation_id])
  end
end
