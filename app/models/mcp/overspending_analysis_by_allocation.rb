module Mcp
  # Query object for the overspending-by-allocation endpoint.
  # Groups budget vs actual spending by individual allocation (line item)
  # within a period, optionally filtered to a single category.
  class OverspendingAnalysisByAllocation
    include ActiveModel::Validations

    attr_reader :period, :category

    validates :period, format: { with: /\A\d{4}-\d{2}\z/, message: "must be in YYYY-MM format, e.g. 2024-03" }

    def initialize(period:, category: nil)
      @period   = period
      @category = category
    end

    # Returns the allocations array exactly as the controller built it.
    # Raises if called when the object is invalid.
    def results
      raise "Call valid? before results" unless valid?

      category_filter      = category ? "AND ac.name = :category" : ""
      canonical_allocation = Allocation.canonical_name_sql('a.name')
      budgeted_conds       = Mcp::SpendingScope.budgeted_conditions
      actual_conds         = Mcp::SpendingScope.actual_conditions

      sql = <<~SQL
        WITH budgeted AS (
          SELECT #{canonical_allocation} AS allocation,
                 ac.id AS category_id,
                 ac.name AS category,
                 SUM(a.amount) AS budgeted_cents
          FROM allocations a
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b ON a.budget_id = b.id
          WHERE #{Mcp::BudgetPeriod.end_month_sql} = :period
            AND b.household_id = :household_id
            AND #{budgeted_conds}
            #{category_filter}
          GROUP BY #{canonical_allocation}, ac.id, ac.name
        ),
        actual AS (
          SELECT #{canonical_allocation} AS allocation,
                 ac.id AS category_id,
                 ac.name AS category,
                 SUM(t.withdrawal_amount) AS actual_cents
          FROM transactions t
          JOIN allocations a ON t.allocation_id = a.id
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b ON t.budget_id = b.id
          WHERE #{Mcp::BudgetPeriod.end_month_sql} = :period
            AND t.household_id = :household_id
            AND #{actual_conds}
            #{category_filter}
          GROUP BY #{canonical_allocation}, ac.id, ac.name
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

      bindings = { period: period, household_id: ActsAsTenant.current_tenant.id, category: category }
      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, bindings])
      )

      result.map do |row|
        budgeted  = row["budgeted_cents"].to_i
        actual    = row["actual_cents"].to_i
        remaining = row["amount_remaining_cents"].to_i
        {
          allocation:               row["allocation"],
          category_id:              row["category_id"].to_i,
          category:                 row["category"],
          budgeted_cents:           budgeted,
          budgeted_display:         Mcp::Money.display(budgeted),
          actual_cents:             actual,
          actual_display:           Mcp::Money.display(actual),
          amount_remaining_cents:   remaining,
          amount_remaining_display: Mcp::Money.display(remaining)
        }
      end
    end
  end
end
