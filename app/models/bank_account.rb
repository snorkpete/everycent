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
#  current_balance :integer
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

    self.current_balance += total_transaction_amount
    self.closing_date = closing_date
    save
  end

  def expected_new_balance
    transaction_list = transactions.where('transaction_date > ?', closing_date).to_a

    new_transaction_total = transaction_list.sum do |transaction|
      transaction.deposit_amount - transaction.withdrawal_amount
    end

    current_balance + new_transaction_total
  end

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
