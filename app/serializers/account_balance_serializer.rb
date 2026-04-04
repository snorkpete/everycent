class AccountBalanceSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_category, :is_cash,
             :closing_date, :next_closing_date,
             :closing_balance, :expected_closing_balance, :current_balance,
             :asset_bank_account_id

  has_one :institution
  has_many :loans, serializer: AccountBalanceSerializer, if: :asset?

  def asset?
    object.account_category == 'asset'
  end
end
