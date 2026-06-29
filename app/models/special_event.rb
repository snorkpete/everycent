# == Schema Information
#
# Table name: special_events
#
#  id            :bigint           not null, primary key
#  actual_amount :integer          default(0), not null
#  budget_amount :integer          default(0), not null
#  name          :string
#  start_date    :date
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  household_id  :bigint           not null
#
# Indexes
#
#  index_special_events_on_household_id  (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id)
#

class SpecialEvent < ApplicationRecord
  # force this model to always require scoping to a household
  acts_as_tenant :household

  has_many :allocations

  validates :name, presence: true
  validates :budget_amount, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :actual_amount, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def self.preloaded
    includes({ allocations: [:budget, :allocation_category, :transactions] } )
  end
end
