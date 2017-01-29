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
#

FactoryGirl.define do
  factory :allocation do
    name "MyString"
amount 1
budget_id 1
allocation_category_id 1
allocation_type "MyString"
is_standing_order 1
bank_account_id 1
  end

end
