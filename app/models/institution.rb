# == Schema Information
#
# Table name: institutions
#
#  id         :integer          not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Institution < ActiveRecord::Base
  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Institution already exists.'
                    }
end
