# == Schema Information
#
# Table name: incomes
#
#  id              :integer          not null, primary key
#  amount          :integer
#  comment         :string
#  name            :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  bank_account_id :integer
#  budget_id       :integer
#  household_id    :bigint
#
# Indexes
#
#  index_incomes_on_bank_account_id  (bank_account_id)
#  index_incomes_on_budget_id        (budget_id)
#  index_incomes_on_household_id     (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

FactoryBot.define do
  factory :income do
    household
    name { Faker::Name.first_name }
    amount { 1 }
    budget
    bank_account
  end

end
