class AccountStatusSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :current_balance, :expected_new_balance

  has_one :institution
end
