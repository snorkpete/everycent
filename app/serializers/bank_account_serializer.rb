class BankAccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_no, :user_id, :institution_id, :opening_balance
end
