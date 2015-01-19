FactoryGirl.define do
  factory :transaction do
    description "MyString"
bank_ref "MyString"
transaction_date "2015-01-19"
withdrawal_amount 1
deposit_amount 1
  end

end
