# == Schema Information
#
# Table name: recurring_allocations
#
#  id                     :integer          not null, primary key
#  name                   :string           not null
#  amount                 :integer
#  allocation_category_id :integer
#  frequency              :string           default("monthly")
#  allocation_type        :string           default("expense")
#  is_standing_order      :boolean
#  bank_account_id        :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class RecurringAllocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :allocation_category_id,
             :frequency, :allocation_type, :is_standing_order,
             :bank_account_id

  has_one :allocation_category
  has_one :bank_account
end
