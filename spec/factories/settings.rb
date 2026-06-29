# == Schema Information
#
# Table name: settings
#
#  id                                                :integer          not null, primary key
#  bank_charges_allocation_name                      :string
#  default_allocation_category_id_for_special_events :integer
#  family_type                                       :string           default("couple")
#  husband                                           :string           default("Husband")
#  single_person                                     :string
#  wife                                              :string           default("Wife")
#  created_at                                        :datetime         not null
#  updated_at                                        :datetime         not null
#  household_id                                      :bigint
#  primary_budget_account_id                         :integer
#
# Indexes
#
#  index_settings_on_household_id  (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

FactoryBot.define do
  factory :setting do
    household
    primary_budget_account_id { 1 }
    bank_charges_allocation_name { "MyString" }
  end

end
