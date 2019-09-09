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
  # force this model to always require scoping to a household
  acts_as_tenant :household
  has_many :recurring_allocations

  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Allocation Category already exists.',
                        scope: :household_id
                    }

  before_save :fix_name

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
