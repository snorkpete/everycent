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

      non_placeholder = Allocation.non_placeholder_amount_sql('a.amount')

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
            AND #{non_placeholder}
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
            AND #{non_placeholder}
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
        {
          category:               row["category"],
          budgeted_cents:         row["budgeted_cents"].to_i,
          actual_cents:           row["actual_cents"].to_i,
          amount_remaining_cents: row["amount_remaining_cents"].to_i
        }
      end
    end
  end
end
