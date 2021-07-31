module CumulativeAllocation
  extend ActiveSupport::Concern

  module ClassMethods

  end

  def amount_for_week(week_no)
    (budget.weighting_for_week(week_no) * amount.to_f).floor
  end

  def spent_for_week(week_no)
    start_date = budget.start_date_for_week(week_no)
    end_date = budget.end_date_for_week(week_no)

    transactions_for_week = transactions.to_a.select do |transaction|
      transaction.transaction_date >= start_date && transaction.transaction_date <= end_date
    end

    transactions_for_week.sum do |transaction|
      transaction.withdrawal_amount - transaction.deposit_amount
    end

  end
end
