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

class InstitutionSerializer < ActiveModel::Serializer
  type 'institution'

  attributes :id, :name
end
