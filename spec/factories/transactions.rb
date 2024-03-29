# == Schema Information
#
# Table name: transactions
#
#  id                      :integer          not null, primary key
#  description             :string
#  bank_ref                :string
#  bank_account_id         :integer
#  transaction_date        :date
#  withdrawal_amount       :integer
#  deposit_amount          :integer
#  payee_id                :integer
#  allocation_id           :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  payee_code              :string
#  payee_name              :string
#  sink_fund_allocation_id :integer
#  status                  :string
#  brought_forward_status  :string
#  household_id            :bigint(8)
#  is_manual_adjustment    :boolean          default(FALSE)
#

FactoryBot.define do
  factory :transaction do
    household
    bank_account
    description { "MyString" }
    bank_ref { "MyString" }
    transaction_date { "2015-01-19" }
    withdrawal_amount { 1 }
    deposit_amount { 1 }

    factory :unpaid_transaction do
      status { 'unpaid' }
    end

    factory :paid_transaction do
      status { 'paid' }
    end
  end

end
