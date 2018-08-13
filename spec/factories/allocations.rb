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

FactoryBot.define do
  factory :allocation do
    household
    allocation_category
    bank_account
    budget
    name "MyString"
    amount 1
    allocation_type "MyString"
    is_standing_order 1
  end

end
