# == Schema Information
#
# Table name: settings
#
#  id                           :integer          not null, primary key
#  primary_budget_account_id    :integer
#  bank_charges_allocation_name :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#

FactoryGirl.define do
  factory :setting do
    primary_budget_account_id 1
bank_charges_allocation_name "MyString"
  end

end
