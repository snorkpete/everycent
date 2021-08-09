# == Schema Information
#
# Table name: allocations
#
#  id                     :integer          not null, primary key
#  name                   :string
#  amount                 :integer
#  budget_id              :integer
#  allocation_category_id :integer
#  allocation_type        :string
#  is_standing_order      :boolean
#  bank_account_id        :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  comment                :string
#

class WeeklyAllocationSerializer < ActiveModel::Serializer
  type 'allocation'

  attributes :id, :name, :amount, :budget_id, :spent,
             :allocation_category_id,
             :allocation_type, :is_standing_order,
             :bank_account_id, :comment,
             :allocation_class, :is_fixed_amount,
             :is_cumulative


  attribute :amount_for_week_1 do
    object.amount_for_week(1)
  end

  attribute :amount_for_week_2 do
    object.amount_for_week(2)
  end

  attribute :amount_for_week_3 do
    object.amount_for_week(3)
  end

  attribute :amount_for_week_4 do
    object.amount_for_week(4)
  end

  attribute :amount_for_week_5 do
    object.amount_for_week(5)
  end


  attribute :spent_for_week_1 do
    object.spent_for_week(1)
  end

  attribute :spent_for_week_2 do
    object.spent_for_week(2)
  end

  attribute :spent_for_week_3 do
    object.spent_for_week(3)
  end

  attribute :spent_for_week_4 do
    object.spent_for_week(4)
  end

  attribute :spent_for_week_5 do
    object.spent_for_week(5)
  end


end
