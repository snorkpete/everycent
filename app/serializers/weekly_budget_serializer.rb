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

class WeeklyBudgetSerializer < ActiveModel::Serializer
  attributes :id, :name, :start_date, :end_date, :status

  has_many :allocations, serializer: WeeklyAllocationSerializer
end

