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
#

class FutureIncomeSerializer < ActiveModel::Serializer
  type 'income'

  attributes :id, :name, :amount, :budget_id, :bank_account_id, :comment

end
