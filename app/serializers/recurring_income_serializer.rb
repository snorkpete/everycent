class RecurringIncomeSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :frequency, :bank_account_id

  has_one :bank_account
end
