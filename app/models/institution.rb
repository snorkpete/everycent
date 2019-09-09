# == Schema Information
#
# Table name: institutions
#
#  id           :integer          not null, primary key
#  name         :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  household_id :bigint(8)
#

class Institution < ApplicationRecord
  # force this model to always require scoping to a household
  acts_as_tenant :household
  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Institution already exists.',
                        scope: :household_id
                    }

  before_save :fix_name

  protected

  def fix_name
    #return if self.name.nil?

    #self.name = name.titleize
  end
end
