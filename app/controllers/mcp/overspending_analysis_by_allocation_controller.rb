module Mcp
  class OverspendingAnalysisByAllocationController < AppController
    def show
      period = params.require(:period)

      unless period.match?(/\A\d{4}-\d{2}\z/)
        render json: { error: "period must be in YYYY-MM format" }, status: :bad_request
        return
      end

      category = params[:category].presence

      render json: {
        period: period,
        category: category,
        amount_unit: "cents (divide by 100 for currency display)",
        allocations: budget_vs_actual_by_allocation(period, category)
      }
    end

    private

    # Same design as OverspendingAnalysisController#budget_vs_actual_by_category
    # but groups by allocation name + category name rather than category alone,
    # giving per-line-item breakdowns. Both CTEs filter to spending categories
    # only. An optional category param narrows both CTEs to a single category
    # by name.
    def budget_vs_actual_by_allocation(period, category)
      category_filter = category ? "AND ac.name = :category" : ""

      sql = <<~SQL
        WITH budgeted AS (
          SELECT a.name AS allocation,
                 ac.id AS category_id,
                 ac.name AS category,
                 SUM(a.amount) AS budgeted_cents
          FROM allocations a
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b ON a.budget_id = b.id
          WHERE to_char(b.start_date, 'YYYY-MM') = :period
            AND b.household_id = :household_id
            AND ac.budget_role IN ('spending', 'annual_spending')
            #{category_filter}
          GROUP BY a.name, ac.id, ac.name
        ),
        actual AS (
          SELECT a.name AS allocation,
                 ac.id AS category_id,
                 ac.name AS category,
                 SUM(t.withdrawal_amount) AS actual_cents
          FROM transactions t
          JOIN allocations a ON t.allocation_id = a.id
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          WHERE to_char(t.transaction_date, 'YYYY-MM') = :period
            AND t.household_id = :household_id
            AND t.is_manual_adjustment = false
            AND t.withdrawal_amount > 0
            AND ac.budget_role IN ('spending', 'annual_spending')
            #{category_filter}
          GROUP BY a.name, ac.id, ac.name
        )
        SELECT
          COALESCE(b.allocation, a.allocation) AS allocation,
          COALESCE(b.category_id, a.category_id) AS category_id,
          COALESCE(b.category, a.category) AS category,
          COALESCE(b.budgeted_cents, 0) AS budgeted_cents,
          COALESCE(a.actual_cents, 0) AS actual_cents,
          COALESCE(b.budgeted_cents, 0) - COALESCE(a.actual_cents, 0) AS amount_remaining_cents
        FROM budgeted b
        FULL OUTER JOIN actual a ON b.allocation = a.allocation AND b.category_id = a.category_id
        ORDER BY amount_remaining_cents ASC
      SQL

      bindings = { period: period, household_id: current_household.id, category: category }
      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, bindings])
      )

      result.map do |row|
        {
          allocation: row["allocation"],
          category_id: row["category_id"].to_i,
          category: row["category"],
          budgeted_cents: row["budgeted_cents"].to_i,
          actual_cents: row["actual_cents"].to_i,
          amount_remaining_cents: row["amount_remaining_cents"].to_i
        }
      end
    end
  end
end
