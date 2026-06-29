# Shared spec helper for creating budget periods with realistic date ranges.
#
# Budget periods run from the 25th of one month through the 24th of the next.
# The `month` argument is the end-month (the one the user sees) — e.g.
# month: '2024-03' produces start_date: 2024-02-25, end_date: 2024-03-24.
#
# Available in all spec examples via RSpec.configure inclusion below.
module BudgetPeriodHelper
  def create_budget_period(month:, **attrs)
    start_date = (Date.parse("#{month}-25") << 1) # 25th of previous month
    end_date   = Date.parse("#{month}-24")        # 24th of this month
    create(:budget, start_date: start_date, end_date: end_date, **attrs)
  end
end

RSpec.configure do |config|
  config.include BudgetPeriodHelper
end
