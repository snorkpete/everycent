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

class AllocationCategorySerializer < ActiveModel::Serializer
  type 'allocation_category'

  attributes :id, :name, :percentage
end
