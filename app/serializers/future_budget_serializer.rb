# == Schema Information
#
# Table name: budgets
#
#  id         :integer          not null, primary key
#  name       :string
#  start_date :date
#  end_date   :date
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  status     :string           default("open")
#

class FutureBudgetSerializer < ActiveModel::Serializer
  type 'budget'

  attributes :id, :name, :start_date, :end_date, :status

  has_many :incomes, serializer: FutureIncomeSerializer
  has_many :allocations, serializer: FutureAllocationSerializer
end

