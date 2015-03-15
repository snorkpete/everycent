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

  validates :name,  presence: true

  before_save :fix_name

  def update_balance(budget_id)
    total_transaction_amount = 0

    transactions = Transaction.for_budget_and_bank(budget_id, self.id).to_a
    transactions.each do |transaction|
      total_transaction_amount += transaction.deposit_amount
      total_transaction_amount -= transaction.withdrawal_amount
    end

    self.current_balance += total_transaction_amount
    save
  end

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
