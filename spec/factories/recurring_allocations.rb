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

FactoryBot.define do
  factory :recurring_allocation do
    name 'Random'
    amount 10000
    allocation_category
  end

end
