# == Schema Information
#
# Table name: transactions
#
#  id                :integer          not null, primary key
#  description       :string
#  bank_ref          :string
#  bank_account_id   :integer
#  transaction_date  :date
#  withdrawal_amount :integer
#  deposit_amount    :integer
#  payee_id          :integer
#  allocation_id     :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

FactoryGirl.define do
  factory :transaction do
    description "MyString"
    bank_ref "MyString"
    transaction_date "2015-01-19"
    withdrawal_amount 1
    deposit_amount 1

    factory :unpaid_transaction do
      status 'unpaid'
    end

    factory :paid_transaction do
      status 'paid'
    end
  end

end
