# == Schema Information
#
# Table name: recurring_incomes
#
#  id              :integer          not null, primary key
#  name            :string
#  amount          :integer
#  frequency       :string           default("monthly")
#  bank_account_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class RecurringIncome < ApplicationRecord
  belongs_to :bank_account
  validates :name, presence: true

  before_save :fix_name

  def to_income
    Income.new(name: name, amount: amount, bank_account_id: bank_account_id)
  end

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
