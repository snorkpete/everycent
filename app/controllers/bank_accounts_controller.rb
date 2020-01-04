class BankAccountsController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end
  before_action :set_bank_account, only: [:show, :edit, :update, :destroy]

  def index
    if params[:include_current_balance]
      @bank_accounts = BankAccount.includes(:transactions).where(status: 'open').order(:name)
      respond_with(@bank_accounts, BankAccountWithBalanceSerializer)
    else
      @bank_accounts = BankAccount.includes(:institution, :user).account_category_order
      @bank_accounts = @bank_accounts.where(status:'open') unless params[:include_closed] == 'true'
      respond_with(@bank_accounts, BankAccountSerializer)
    end
  end

  def show
    respond_with(@bank_account, BankAccountSerializer)
  end

  def new
    @bank_account = BankAccount.new
    respond_with(@bank_account, BankAccountSerializer)
  end

  def edit
  end

  def create
    @bank_account = BankAccount.new(bank_account_params)
    @bank_account.save
    respond_with(@bank_account, BankAccountSerializer)
  end

  def update
    @bank_account.update(bank_account_params)
    respond_with(@bank_account, BankAccountSerializer)
  end

  def manually_adjust_balances
    result = BankAccount.manually_adjust_balances(params[:adjustments])
    if result
      render json: { success: true }
    else
      render json: { success: false }, status: 400
    end
  end

  def transfer
    result = BankAccount.transfer(params)

    if result[:success]
      render json: result
    else
      render json: result, status: 400
    end
  end

  def destroy
    @bank_account.destroy
    respond_with(@bank_account, BankAccountSerializer)
  end

  private
    def set_bank_account
      @bank_account = BankAccount.find(params[:id])
    end

    def bank_account_params
      params.fetch(:bank_account, {}).permit(:name, :account_type, :account_type_description, :is_cash, :account_no,
                                             :user_id, :institution_id, :opening_balance, :account_category,
                                             :allow_default_allocations, :status,
                                             :import_format,
                                             :statement_day, :payment_due_day)
    end
end
