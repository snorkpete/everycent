# == Schema Information
#
# Table name: allocations
#
#  id                     :integer          not null, primary key
#  name                   :string
#  amount                 :integer
#  budget_id              :integer
#  allocation_category_id :integer
#  allocation_type        :string
#  is_standing_order      :boolean
#  bank_account_id        :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  comment                :string
#  household_id           :bigint(8)
#

class SpecialEventAllocationSerializer < ActiveModel::Serializer
  type 'allocation'

  attributes :id, :name, :amount, :budget_id, :spent,
             :allocation_category_id, :budget_name, :allocation_category_name

  has_one :allocation_category, serializer: AllocationCategorySerializer
  has_one :budget, serializer: SimpleBudgetSerializer

  def budget_name
    object.budget&.name
  end

  def allocation_category_name
    object.allocation_category&.name
  end
end
