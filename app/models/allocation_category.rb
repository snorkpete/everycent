# == Schema Information
#
# Table name: allocation_categories
#
#  id         :integer          not null, primary key
#  name       :string
#  percentage :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class AllocationCategory < ApplicationRecord

  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Allocation Category already exists.'
                    }

  before_save :fix_name

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
