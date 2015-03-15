class BankAccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_no, :user_id, :institution_id, :opening_balance, :current_balance

  has_one :user
  has_one :institution
end
