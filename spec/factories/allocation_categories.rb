# == Schema Information
#
# Table name: allocation_categories
#
#  id           :integer          not null, primary key
#  budget_role  :string           default("spending"), not null
#  name         :string
#  percentage   :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  household_id :bigint
#
# Indexes
#
#  index_allocation_categories_on_household_id  (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

FactoryBot.define do
  factory :allocation_category do
    household
    name { Faker::Name.name }
  end
end
