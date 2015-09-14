# == Schema Information
#
# Table name: bank_accounts
#
#  id               :integer          not null, primary key
#  name             :string
#  account_type     :string
#  account_no       :string
#  user_id          :integer
#  institution_id   :integer
#  opening_balance  :integer
#  closing_balance  :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  closing_date     :date
#  account_category :string           default("asset")
#

class BankAccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_type_description, :account_category, :account_no,
             :user_id, :institution_id, :opening_balance, :closing_balance,
             :allow_default_allocations, :is_sink_fund, :status

  has_one :user
  has_one :institution
end
