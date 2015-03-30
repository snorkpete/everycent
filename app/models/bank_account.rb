# == Schema Information
#
# Table name: bank_accounts
#
#  id              :integer          not null, primary key
#  name            :string
#  account_type    :string
#  account_no      :string
#  user_id         :integer
#  institution_id  :integer
#  opening_balance :integer
#  closing_balance :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class BankAccount < ActiveRecord::Base

  belongs_to :user
  belongs_to :institution

  has_many :transactions

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

  def expected_closing_balance
    next_budget_to_close = Budget.where(status: 'open').order(:start_date).first
    return 0 if next_budget_to_close.nil?

    expected_end_date = next_budget_to_close.end_date

    transaction_list = transactions.where('transaction_date > ? and transaction_date <= ?',
                                          closing_date, expected_end_date).to_a

    new_transaction_total = transaction_list.sum do |transaction|
      transaction.deposit_amount - transaction.withdrawal_amount
    end

    closing_balance.to_i + new_transaction_total
  end

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
