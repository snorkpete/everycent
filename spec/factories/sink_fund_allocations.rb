# == Schema Information
#
# Table name: sink_fund_allocations
#
#  id              :integer          not null, primary key
#  name            :string
#  bank_account_id :integer
#  amount          :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  comment         :string
#  status          :string           default("open")
#  household_id    :bigint(8)
#

FactoryBot.define do
  factory :sink_fund_allocation do
    name { "MyString" }
    bank_account
    amount { 1 }
  end

end
