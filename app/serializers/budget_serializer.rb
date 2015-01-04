class BudgetSerializer < ActiveModel::Serializer
  attributes :id, :name, :start_date, :end_date

  has_many :incomes
  has_many :allocations
end
