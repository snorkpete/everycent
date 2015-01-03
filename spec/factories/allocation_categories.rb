# == Schema Information
#
# Table name: allocation_categories
#
#  id         :integer          not null, primary key
#  name       :string
#  percentage :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

FactoryGirl.define do
  factory :allocation_category do
    name { Faker::Name.name }
  end
end
