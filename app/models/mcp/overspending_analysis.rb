module Mcp
  # Query object for the overspending analysis endpoint.
  # Groups budget vs actual spending by allocation category for a given period.
  class OverspendingAnalysis
    include ActiveModel::Validations

    attr_reader :period

    validates :period, format: { with: /\A\d{4}-\d{2}\z/, message: "must be in YYYY-MM format, e.g. 2024-03" }

    def initialize(period:)
      @period = period
    end

    # Returns the categories array exactly as the controller built it.
    # Raises if called when the object is invalid.
    def results
      raise "Call valid? before results" unless valid?

      budgeted_conds = Mcp::SpendingScope.budgeted_conditions
      actual_conds   = Mcp::SpendingScope.actual_conditions

      sql = <<~SQL
        WITH budgeted AS (
          SELECT ac.name AS category,
                 SUM(a.amount) AS budgeted_cents
          FROM allocations a
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b ON a.budget_id = b.id
          WHERE to_char(b.start_date, 'YYYY-MM') = :period
            AND b.household_id = :household_id
            AND #{budgeted_conds}
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
            AND #{actual_conds}
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

      bindings = { period: period, household_id: ActsAsTenant.current_tenant.id }
      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, bindings])
      )

      result.map do |row|
        budgeted  = row["budgeted_cents"].to_i
        actual    = row["actual_cents"].to_i
        remaining = row["amount_remaining_cents"].to_i
        {
          category:                row["category"],
          budgeted_cents:          budgeted,
          budgeted_display:        Mcp::Money.display(budgeted),
          actual_cents:            actual,
          actual_display:          Mcp::Money.display(actual),
          amount_remaining_cents:  remaining,
          amount_remaining_display: Mcp::Money.display(remaining)
        }
      end
    end
  end
end
