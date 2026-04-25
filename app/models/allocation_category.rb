# == Schema Information
#
# Table name: allocation_categories
#
#  id           :integer          not null, primary key
#  name         :string
#  percentage   :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  household_id :bigint(8)
#

class AllocationCategory < ApplicationRecord
  BUDGET_ROLES = %w[spending annual_spending transfer savings event].freeze

  # force this model to always require scoping to a household
  acts_as_tenant :household
  has_many :recurring_allocations

  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Allocation Category already exists.',
                        scope: :household_id
                    }
  validates :budget_role, inclusion: { in: BUDGET_ROLES }

  before_save :fix_name

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
