# == Schema Information
#
# Table name: bank_accounts
#
#  id                         :integer          not null, primary key
#  account_category           :string           default("asset")
#  account_no                 :string
#  account_type               :string           default("normal")
#  account_type_description   :string
#  allow_default_allocations  :boolean          default(FALSE)
#  closing_balance            :integer
#  closing_date               :date
#  default_sub_account_amount :integer          default(0)
#  import_format              :string           default("")
#  is_cash                    :boolean          default(TRUE)
#  name                       :string
#  opening_balance            :integer
#  payment_due_day            :integer
#  statement_day              :integer
#  status                     :string           default("open")
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  asset_bank_account_id      :integer
#  household_id               :bigint
#  institution_id             :integer
#  user_id                    :integer
#
# Indexes
#
#  index_bank_accounts_on_asset_bank_account_id  (asset_bank_account_id)
#  index_bank_accounts_on_household_id           (household_id)
#  index_bank_accounts_on_institution_id         (institution_id)
#  index_bank_accounts_on_user_id                (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (asset_bank_account_id => bank_accounts.id)
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

class BankAccount < ApplicationRecord
  include CreditCard
  include SinkFund
  include ManualBalanceAdjustments
  include Transfers

  # force this model to always require scoping to a household
  acts_as_tenant :household

  # TODO: temporarily make this optional - debugging broken specs
  belongs_to :institution, optional: true

  # TODO: is this actually needed anymore? we don't really make use of it
  belongs_to :user, optional: true

  belongs_to :asset_bank_account, class_name: 'BankAccount', optional: true
  has_many :loans, class_name: 'BankAccount', foreign_key: :asset_bank_account_id

  has_many :transactions
  has_many :sink_fund_allocations,  -> { order(:status => :desc, :name => :asc) }

  before_create :update_closing_info

  validates :name,  presence: true

  # TODO
  validates :statement_day, :numericality => {:only_integer => true, :greater_than => 0, :less_than => 32, :allow_nil => true}
  validates :payment_due_day, :numericality => {:only_integer => true, :greater_than => 0, :less_than => 32, :allow_nil => true}

  validate :asset_bank_account_only_for_liabilities

  def update_closing_info
    self.closing_balance = opening_balance || 0

    next_budget_to_close = Budget.where(status: 'open').order(:start_date).first
    new_closing_date = if next_budget_to_close.nil? then Date.today else next_budget_to_close.start_date end
    self.closing_date = new_closing_date
  end

  def self.account_category_order
    order(Arel.sql("CASE when account_category='current' THEN 1 ELSE 2 END, account_category, name"))
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

  private

  def asset_bank_account_only_for_liabilities
    if asset_bank_account_id.present? && account_category != 'liability'
      errors.add(:asset_bank_account_id, 'can only be set on liability accounts')
    end
  end

end
