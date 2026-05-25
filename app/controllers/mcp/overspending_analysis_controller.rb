module Mcp
  class OverspendingAnalysisController < AppController
    def show
      period = params.require(:period)

      unless period.match?(/\A\d{4}-\d{2}\z/)
        render json: { error: "period must be in YYYY-MM format" }, status: :bad_request
        return
      end

      render json: {
        period: period,
        amount_unit: "cents (divide by 100 for currency display)",
        categories: budget_vs_actual_by_category(period)
      }
    end

    private

    def budget_vs_actual_by_category(period)
      # Transactions currently link to budgets by transaction_date (date
      # range), not by allocation.budget_id — see open task
      # link-transactions-to-budgets-by-foreign-key-instead-of-date-range.
      # So "budgeted" aggregates allocations whose budget starts in the
      # period, while "actual" aggregates transactions whose
      # transaction_date falls in the period. The allocation join on the
      # actual side is just for category lookup.
      sql = <<~SQL
        WITH budgeted AS (
          SELECT ac.name AS category,
                 SUM(a.amount) AS budgeted_cents
          FROM allocations a
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b ON a.budget_id = b.id
          WHERE to_char(b.start_date, 'YYYY-MM') = :period
            AND b.household_id = :household_id
            AND ac.budget_role = 'spending'
          GROUP BY ac.name
        ),
        actual AS (
          SELECT ac.name AS category,
                 SUM(t.withdrawal_amount) AS actual_cents
          FROM transactions t
          JOIN allocations a ON t.allocation_id = a.id
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          WHERE to_char(t.transaction_date, 'YYYY-MM') = :period
            AND t.household_id = :household_id
            AND t.is_manual_adjustment = false
            AND t.withdrawal_amount > 0
            AND ac.budget_role = 'spending'
            AND (t.brought_forward_status IS NULL
                 OR t.brought_forward_status NOT IN ('added', 'adjustment'))
          GROUP BY ac.name
        )
        SELECT
          COALESCE(b.category, a.category) AS category,
          COALESCE(b.budgeted_cents, 0) AS budgeted_cents,
          COALESCE(a.actual_cents, 0) AS actual_cents,
          COALESCE(b.budgeted_cents, 0) - COALESCE(a.actual_cents, 0) AS amount_remaining_cents
        FROM budgeted b
        FULL OUTER JOIN actual a ON b.category = a.category
        ORDER BY amount_remaining_cents ASC
      SQL

      bindings = { period: period, household_id: current_household.id }
      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, bindings])
      )

      result.map do |row|
        {
          category: row["category"],
          budgeted_cents: row["budgeted_cents"].to_i,
          actual_cents: row["actual_cents"].to_i,
          amount_remaining_cents: row["amount_remaining_cents"].to_i
        }
      end
    end
  end
end
