
# == Schema Information
#
# Table name: bank_accounts
#
#  id              :integer          not null, primary key
#  name            :string
#  account_type    :string
#  account_no      :string
#  user_id         :integer
#  institution_id  :integer
#  opening_balance :integer
#  current_balance :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

FactoryGirl.define do
  factory :bank_account do
    name "My savings account"
  end

end
