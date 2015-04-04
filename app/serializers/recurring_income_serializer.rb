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

class RecurringIncomeSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :frequency, :bank_account_id

  has_one :bank_account
end
