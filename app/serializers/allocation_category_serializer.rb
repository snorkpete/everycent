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

class AllocationCategorySerializer < ActiveModel::Serializer
  attributes :id, :name, :percentage
end
