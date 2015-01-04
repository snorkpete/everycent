class AllocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :budget_id,
             :allocation_category_id,
             :allocation_type, :is_standing_order,
             :bank_account_id

  has_one :allocation_category
  has_one :bank_account
end
