# == Schema Information
#
# Table name: incomes
#
#  id              :integer          not null, primary key
#  name            :string
#  amount          :integer
#  budget_id       :integer
#  bank_account_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  comment         :string
#  household_id    :bigint(8)
#

class IncomeSerializer < ActiveModel::Serializer
  type 'income'

  attributes :id, :name, :amount, :budget_id, :bank_account_id, :comment

  has_one :bank_account
end
