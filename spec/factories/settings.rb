# == Schema Information
#
# Table name: settings
#
#  id                           :integer          not null, primary key
#  primary_budget_account_id    :integer
#  bank_charges_allocation_name :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  husband                      :string           default("Husband")
#  wife                         :string           default("Wife")
#  family_type                  :string           default("couple")
#  single_person                :string
#  household_id                 :bigint(8)
#

FactoryBot.define do
  factory :setting do
    household
    primary_budget_account_id 1
    bank_charges_allocation_name "MyString"
  end

end
