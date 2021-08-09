# == Schema Information
#
# Table name: households
#
#  id         :bigint(8)        not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#


FactoryBot.define do
  factory :household do
    name { "My Household" }
  end

end
