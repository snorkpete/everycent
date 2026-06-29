module Mcp
  # Shared SQL-fragment helpers for budget-period labeling.
  #
  # Budget periods run from the 25th of one month through the 24th of the next.
  # The conventional "budget month" label is the end-date month — the month whose
  # name users recognise (e.g. the Feb 25–Mar 24 period is called "March 2024").
  module BudgetPeriod
    # Returns a SQL expression that labels a budget period by its end-date month.
    #
    # Using end_date for labeling means "March 2024" is 'YYYY-MM' = '2024-03',
    # regardless of the start_date falling in February.
    #
    # @param budget_alias [String] SQL alias for the budgets table (default 'b')
    # @return [String] SQL fragment returning a 'YYYY-MM' string
    def self.end_month_sql(budget_alias = 'b')
      "to_char(#{budget_alias}.end_date, 'YYYY-MM')"
    end
  end
end
