# == Schema Information
#
# Table name: special_events
#
#  id             :integer          not null, primary key
#  name           :string
#  budget_amount  :integer          default(0), not null
#  actual_amount  :integer          default(0), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  household_id   :bigint(8)
#

FactoryBot.define do
  factory :special_event do
    household
    name { Faker::Lorem.words(number: 2).join(' ').titleize }
    budget_amount { 0 }
    actual_amount { 0 }
  end
end 