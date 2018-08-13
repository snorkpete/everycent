# == Schema Information
#
# Table name: households
#
#  id         :bigint(8)        not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Household < ApplicationRecord

  has_many :bank_accounts
  has_many :allocation_categories
  has_many :allocations
  has_many :bank_accounts
  has_many :budgets
  has_many :incomes
  has_many :institutions
  has_many :payees
  has_many :recurring_allocations
  has_many :recurring_incomes
  has_many :settings
  has_many :sink_fund_allocations
  has_many :transactions

end
