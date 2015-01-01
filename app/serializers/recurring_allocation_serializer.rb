class RecurringAllocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :allocation_category_id,
             :frequency, :allocation_type, :is_standing_order,
             :bank_account_id

  has_one :allocation_category
  has_one :bank_account
end
