# == Schema Information
#
# Table name: institutions
#
#  id         :integer          not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Institution < ApplicationRecord
  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Institution already exists.'
                    }

  before_save :fix_name

  protected

  def fix_name
    #return if self.name.nil?

    #self.name = name.titleize
  end
end
