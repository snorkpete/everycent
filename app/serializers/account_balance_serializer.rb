class AccountBalanceSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :closing_balance, :current_balance

  has_one :institution
end
