module Mcp
  # Query object for the out_of_budget_analysis endpoint.
  #
  # Analyses spending in the "out-of-budget" / shock-absorber categories — the
  # escape valve that absorbs spending outside the normal budget (e.g. the
  # Out-of-Budget / Sink Fund Transfers and Over Budget Supplement categories).
  #
  # Category identification: these categories are classified with
  # budget_role = 'transfer' on AllocationCategory. The tool scopes by that role
  # rather than by category name, so it automatically tracks whatever the
  # household classifies as a transfer / escape-valve category.
  #
  # Bookkeeping gates:
  # - Excludes brought-forward transactions (brought_forward_status IN ('added','adjustment'))
  # - Excludes manual adjustments
  # - Scopes to budget_role = 'transfer' (not placeholder exclusion — this tool's
  #   subject IS the transfer category, placeholder filtering is irrelevant)
  class OutOfBudgetAnalysis
    include ActiveModel::Validations

    VALID_GROUP_BY = %w[month allocation_name calendar_month].freeze

    # Categories representing the out-of-budget / shock-absorber mechanism are
    # classified with this budget_role (see the budget_role enum on AllocationCategory).
    OOB_BUDGET_ROLE = 'transfer'.freeze

    attr_reader :start_month, :end_month, :group_by

    validates :start_month,
              format: {
                with:    /\A\d{4}-\d{2}\z/,
                message: "start_month must be in YYYY-MM format, e.g. 2024-03"
              }

    validates :end_month,
              format: {
                with:    /\A\d{4}-\d{2}\z/,
                message: "end_month must be in YYYY-MM format, e.g. 2024-03"
              }

    validate :end_month_not_before_start_month

    validates :group_by,
              inclusion: {
                in:      VALID_GROUP_BY,
                message: "group_by must be one of: #{VALID_GROUP_BY.join(', ')}"
              }

    def initialize(start_month:, end_month:, group_by: 'month')
      @start_month = start_month
      @end_month   = end_month
      @group_by    = group_by
    end

    # Returns result rows. Raises if called on an invalid object or if no
    # transfer-role (out-of-budget) categories exist for the tenant.
    def results
      raise "Call valid? before results" unless valid?

      if AllocationCategory.where(budget_role: OOB_BUDGET_ROLE).empty?
        raise "No categories with budget_role = '#{OOB_BUDGET_ROLE}' found. Out-of-budget " \
              "analysis requires the escape-valve categories to be classified as transfer."
      end

      case group_by
      when 'month'       then results_by_month
      when 'allocation_name' then results_by_allocation
      when 'calendar_month'  then results_by_calendar_month
      end
    end

    private

    # OOB spend per budget period, chronological order.
    def results_by_month
      sql = <<~SQL
        SELECT
          to_char(b.start_date, 'YYYY-MM') AS month,
          SUM(t.withdrawal_amount)         AS total_cents
        FROM transactions t
        JOIN allocations a           ON t.allocation_id = a.id
        JOIN allocation_categories ac ON a.allocation_category_id = ac.id
        JOIN budgets b                ON a.budget_id = b.id
        WHERE t.household_id = :household_id
          AND #{oob_transaction_conditions}
          AND to_char(b.start_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
        GROUP BY to_char(b.start_date, 'YYYY-MM')
        ORDER BY month ASC
      SQL

      execute_and_map(sql) do |row|
        total = row["total_cents"].to_i
        { month: row["month"], total_cents: total, total_display: Mcp::Money.display(total) }
      end
    end

    # Recurring OOB items ranked by total spend across the date range.
    def results_by_allocation
      sql = <<~SQL
        SELECT
          #{canonical_allocation_name} AS allocation_name,
          SUM(t.withdrawal_amount)     AS total_cents
        FROM transactions t
        JOIN allocations a            ON t.allocation_id = a.id
        JOIN allocation_categories ac ON a.allocation_category_id = ac.id
        JOIN budgets b                ON a.budget_id = b.id
        WHERE t.household_id = :household_id
          AND #{oob_transaction_conditions}
          AND to_char(b.start_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
        GROUP BY #{canonical_allocation_name}
        ORDER BY total_cents DESC
      SQL

      execute_and_map(sql) do |row|
        total = row["total_cents"].to_i
        { allocation_name: row["allocation_name"], total_cents: total, total_display: Mcp::Money.display(total) }
      end
    end

    # Seasonality: which calendar months (1–12) are worst on average.
    # Two-step: first aggregate per (calendar_month, budget_month), then average
    # across years — this gives a true per-calendar-month average regardless of how
    # many budget periods fall in a given year. Caveat: this holds for the standard
    # monthly budget cadence; if a calendar month ever spans >1 budget period, those
    # sub-periods are averaged together first before contributing to the year average.
    def results_by_calendar_month
      sql = <<~SQL
        WITH monthly_budget_spend AS (
          SELECT
            EXTRACT(MONTH FROM b.start_date)::integer AS calendar_month,
            to_char(b.start_date, 'YYYY-MM')          AS budget_month,
            SUM(t.withdrawal_amount)                   AS period_total_cents
          FROM transactions t
          JOIN allocations a            ON t.allocation_id = a.id
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b                ON a.budget_id = b.id
          WHERE t.household_id = :household_id
            AND #{oob_transaction_conditions}
            AND to_char(b.start_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
          GROUP BY EXTRACT(MONTH FROM b.start_date)::integer, to_char(b.start_date, 'YYYY-MM')
        )
        SELECT
          calendar_month,
          TO_CHAR(
            MAKE_DATE(2000, calendar_month, 1),
            'Mon'
          )                                                 AS month_name,
          COUNT(*)                                          AS year_count,
          SUM(period_total_cents)                           AS total_cents,
          ROUND(AVG(period_total_cents)::numeric, 0)::bigint AS avg_monthly_cents
        FROM monthly_budget_spend
        GROUP BY calendar_month
        ORDER BY avg_monthly_cents DESC
      SQL

      execute_and_map(sql) do |row|
        total = row["total_cents"].to_i
        avg   = row["avg_monthly_cents"].to_i
        {
          calendar_month:      row["calendar_month"].to_i,
          month_name:          row["month_name"],
          year_count:          row["year_count"].to_i,
          total_cents:         total,
          total_display:       Mcp::Money.display(total),
          avg_monthly_cents:   avg,
          avg_monthly_display: Mcp::Money.display(avg)
        }
      end
    end

    # SQL fragment: transaction conditions for OOB category scope.
    # Excludes brought-forward and manual adjustments; scopes to budget_role = 'transfer'.
    # The role is passed as a bound param :oob_budget_role (added in execute_and_map).
    def oob_transaction_conditions(txn_alias: 't', allocation_alias: 'a', category_alias: 'ac')
      <<~SQL.strip
        #{txn_alias}.is_manual_adjustment = false
        AND #{txn_alias}.withdrawal_amount > 0
        AND (#{txn_alias}.brought_forward_status IS NULL
             OR #{txn_alias}.brought_forward_status NOT IN ('added', 'adjustment'))
        AND #{category_alias}.budget_role = :oob_budget_role
      SQL
    end

    def canonical_allocation_name
      Allocation.canonical_name_sql('a.name')
    end

    def execute_and_map(sql, &block)
      bindings = {
        start_month:     start_month,
        end_month:       end_month,
        household_id:    ActsAsTenant.current_tenant.id,
        oob_budget_role: OOB_BUDGET_ROLE
      }
      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, bindings])
      )
      result.map(&block)
    end

    def end_month_not_before_start_month
      return unless start_month.match?(/\A\d{4}-\d{2}\z/) && end_month.match?(/\A\d{4}-\d{2}\z/)

      if end_month < start_month
        errors.add(
          :base,
          "end_month (#{end_month}) must not be before start_month (#{start_month})"
        )
      end
    end
  end
end
