# == Schema Information
#
# Table name: incomes
#
#  id              :integer          not null, primary key
#  name            :string
#  amount          :integer
#  budget_id       :integer
#  bank_account_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  comment         :string
#  household_id    :bigint(8)
#

FactoryBot.define do
  factory :income do
    household
    name { Faker::Name.first_name }
    amount 1
    budget
    bank_account
  end

end
