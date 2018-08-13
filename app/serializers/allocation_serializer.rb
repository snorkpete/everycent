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

class AllocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :budget_id, :spent,
             :allocation_category_id,
             :allocation_type, :is_standing_order,
             :bank_account_id, :comment

  has_one :allocation_category
  has_one :bank_account
end
