# == Schema Information
#
# Table name: special_events
#
#  id            :bigint           not null, primary key
#  actual_amount :integer          default(0), not null
#  budget_amount :integer          default(0), not null
#  name          :string
#  start_date    :date
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  household_id  :bigint           not null
#
# Indexes
#
#  index_special_events_on_household_id  (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id)
#

FactoryBot.define do
  factory :special_event do
    household
    name { Faker::Lorem.words(number: 2).join(' ').titleize }
    budget_amount { 0 }
    actual_amount { 0 }
  end
end 
