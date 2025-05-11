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

class SpecialEvent < ApplicationRecord
  # force this model to always require scoping to a household
  acts_as_tenant :household

  has_many :allocations

  validates :name, presence: true
  validates :budget_amount, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :actual_amount, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
