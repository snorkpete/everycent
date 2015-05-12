class BankAccountsController < ApplicationController
  before_action :set_bank_account, only: [:show, :edit, :update, :destroy]

  def index
    @bank_accounts = BankAccount.includes(:institution, :user).order(:account_category, :name)
    @bank_accounts = @bank_accounts.where(status:'open') unless params[:include_closed] == 'true'
    respond_with(@bank_accounts, BankAccountSerializer)
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

  def destroy
    @bank_account.destroy
    respond_with(@bank_account, BankAccountSerializer)
  end

  private
    def set_bank_account
      @bank_account = BankAccount.find(params[:id])
    end

    def bank_account_params
      params.fetch(:bank_account, {}).permit(:name, :account_type, :account_no, :user_id, :institution_id, :opening_balance, :account_category, :allow_default_allocations, :is_sink_fund, :status)
    end
end
