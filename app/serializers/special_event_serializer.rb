# == Schema Information
#
# Table name: special_events
#
#  id             :integer          not null, primary key
#  name           :string
#  budget_amount  :integer          default(0), not null
#  actual_amount  :integer          default(0), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  household_id   :bigint(8)
#

class SpecialEventSerializer < ActiveModel::Serializer
  type 'special_event'

  attributes :id, :name, :budget_amount, :actual_amount, :start_date

  has_many :allocations, serializer: SpecialEventAllocationSerializer
end
