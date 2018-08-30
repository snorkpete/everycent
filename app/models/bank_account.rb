# == Schema Information
#
# Table name: bank_accounts
#
#  id                         :integer          not null, primary key
#  name                       :string
#  account_type_description   :string
#  account_no                 :string
#  user_id                    :integer
#  institution_id             :integer
#  opening_balance            :integer
#  closing_balance            :integer
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  closing_date               :date
#  account_category           :string           default("asset")
#  allow_default_allocations  :boolean          default(FALSE)
#  default_sub_account_amount :integer          default(0)
#  status                     :string           default("open")
#  account_type               :string           default("normal")
#  statement_day              :integer
#  payment_due_day            :integer
#  is_cash                    :boolean          default(TRUE)
#  import_format              :string           default("")
#  household_id               :bigint(8)
#

class BankAccount < ApplicationRecord
  include CreditCard
  include SinkFund
  include ManualBalanceAdjustments

  # force this model to always require scoping to a household
  acts_as_tenant :household

  belongs_to :user
  # TODO: temporarily make this optional - debugging broken specs
  belongs_to :institution, optional: true

  has_many :transactions
  has_many :sink_fund_allocations,  -> { order(:status => :desc, :name => :asc) }

  before_create :update_closing_info

  validates :name,  presence: true

  # TODO
  validates :statement_day, :numericality => {:only_integer => true, :greater_than => 0, :less_than => 32, :allow_nil => true}
  validates :payment_due_day, :numericality => {:only_integer => true, :greater_than => 0, :less_than => 32, :allow_nil => true}

  def update_closing_info
    self.closing_balance = opening_balance
    self.closing_date = Date.today
    # save
  end

  def self.account_category_order
    order("CASE when account_category='current' THEN 1 ELSE 2 END, account_category, name")
  end

  def update_balance(budget_id, closing_date)
    total_transaction_amount = 0

    transactions = Transaction.for_budget_and_bank(budget_id, self.id).to_a
    transactions.each do |transaction|
      total_transaction_amount += transaction.deposit_amount
      total_transaction_amount -= transaction.withdrawal_amount
    end

    # initialize closing balance if it hasn't been used yet
    # this happens with new accounts
    # This should no longer happen and can probably be removed
    if self.closing_balance.nil?
      self.closing_balance = opening_balance || 0
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

end
