class IncomeSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :budget_id, :bank_account_id

  has_one :bank_account
end
