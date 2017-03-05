class AccountBalanceSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_category, :is_cash,
             :closing_date, :next_closing_date,
             :closing_balance, :expected_closing_balance, :current_balance

  has_one :institution
end
