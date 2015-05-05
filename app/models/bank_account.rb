# == Schema Information
#
# Table name: bank_accounts
#
#  id               :integer          not null, primary key
#  name             :string
#  account_type     :string
#  account_no       :string
#  user_id          :integer
#  institution_id   :integer
#  opening_balance  :integer
#  closing_balance  :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  closing_date     :date
#  account_category :string           default("asset")
#

class BankAccount < ActiveRecord::Base

  belongs_to :user
  belongs_to :institution

  has_many :transactions
  has_many :sub_accounts

  validates :name,  presence: true

  before_save :fix_name

  def update_balance(budget_id, closing_date)
    total_transaction_amount = 0

    transactions = Transaction.for_budget_and_bank(budget_id, self.id).to_a
    transactions.each do |transaction|
      total_transaction_amount += transaction.deposit_amount
      total_transaction_amount -= transaction.withdrawal_amount
    end

    self.closing_balance += total_transaction_amount
    self.closing_date = closing_date
    save
  end

  def current_balance
    transaction_list = transactions.where('transaction_date > ?', closing_date).to_a

    new_transaction_total = transaction_list.sum do |transaction|
      transaction.deposit_amount - transaction.withdrawal_amount
    end

    closing_balance.to_i + new_transaction_total
  end

  def sub_account_balance
    sub_accounts.sum(:amount)
  end

  def expected_closing_balance
    transaction_list = transactions.where('transaction_date > ? and transaction_date <= ?',
                                          closing_date, next_closing_date).to_a

    new_transaction_total = transaction_list.sum do |transaction|
      transaction.deposit_amount - transaction.withdrawal_amount
    end

    closing_balance.to_i + new_transaction_total
  end

  def next_closing_date
    next_budget_to_close = Budget.where(status: 'open').order(:start_date).first
    return Date.today if next_budget_to_close.nil?

    next_budget_to_close.end_date
  end

  ### Sink Fund related functions
  ### TODO: possibly move these into their own concern/module
  def self.sink_funds
    self.where(is_sink_fund: true)
  end

  def self.update_sink_fund(input_params)
    params = ActionController::Parameters.new(input_params)
    params = params.permit(:sink_fund => [:id, {sub_accounts: [:name, :amount, :comment] }]).require(:sink_fund)

    sink_fund = BankAccount.find(params[:id])

    updated_sub_accounts = params[:sub_accounts].map do |sub_account_params|
      SubAccount.new(sub_account_params)
    end

    validate do
      if updated_sub_accounts.sum(&:amount) > sink_fund.current_balance
        sink_fund.errors.add(:base, "Sub account balance exceeds current balance")
      end
    end

    if sink_fund.valid?
      sink_fund.sub_accounts = updated_sub_accounts
    end
    sink_fund
  end

  #validate :sub_account_total_less_than_current_balance

  #def sub_account_total_less_than_current_balance
  #  if
  #end

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
