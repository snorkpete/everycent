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
                               .order(transaction_date: :desc)
                        # .limit(25)
                        # # TODO: should we remove this limit? with it, the transactions may not be accurate
                        # Without it, we run the risk of trying to load too much data
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

  def import_preview
    budget = Budget.find(params[:budget_id])
    service = ImportPreviewService.new(
      budget: budget,
      bank_accounts_params: import_preview_params[:bank_accounts] || []
    )
    result = service.call
    render json: result
  rescue ImportPreviewService::ValidationError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: e.message }, status: :not_found
  end

  def import_save
    budget = Budget.find(params[:budget_id])
    service = ImportSaveService.new(
      budget: budget,
      bank_accounts_params: import_save_params[:bank_accounts] || []
    )
    result = service.call
    render json: result
  rescue ImportSaveService::ValidationError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: e.message }, status: :not_found
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
      :allocation_id, :sink_fund_allocation_id, :status, :brought_forward_status, :camt_imported])
  end

  def import_save_params
    params.permit(
      :budget_id,
      bank_accounts: [
        :bank_account_id,
        :iban,
        { transactions: [:transaction_date, :description, :withdrawal_amount, :deposit_amount, :bank_ref, :status, :deleted, :camt_imported] }
      ]
    )
  end

  def import_preview_params
    params.permit(
      :budget_id,
      bank_accounts: [
        :bank_account_id,
        :iban,
        { transactions: [:transaction_date, :description, :withdrawal_amount, :deposit_amount, :bank_ref, :status] }
      ]
    )
  end
end
