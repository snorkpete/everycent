class AccountBalanceSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_category, :closing_balance, :current_balance

  has_one :institution
end
