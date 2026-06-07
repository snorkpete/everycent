module Mcp
  # Query object for the budget_accuracy endpoint.
  #
  # Measures how accurately each allocation (or category) was budgeted across
  # a range of months by computing per-(group, month) %-off distributions.
  #
  # Scope: spending-role allocations only; brought-forward and placeholder
  # entries excluded (via Mcp::SpendingScope). Groups whose total budgeted
  # amount is <= 1000 cents in a month are also excluded (the €10 noise floor
  # — accuracy on a tiny line item is not actionable).
  class BudgetAccuracy
    include ActiveModel::Validations

    VALID_GROUP_BY = %w[allocation category].freeze
    VALID_SORT_BY  = %w[pct_off overspend_amount underspend_amount].freeze

    attr_reader :start_month, :end_month, :group_by, :sort_by, :variable_only

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

    validates :sort_by,
              inclusion: {
                in:      VALID_SORT_BY,
                message: "sort_by must be one of: #{VALID_SORT_BY.join(', ')}"
              }

    def initialize(start_month:, end_month:, group_by: 'allocation', sort_by: 'pct_off', variable_only: false)
      @start_month   = start_month
      @end_month     = end_month
      @group_by      = group_by
      @sort_by       = sort_by
      @variable_only = variable_only
    end

    # Returns the accuracy rows. Raises if called on an invalid object.
    def results
      raise "Call valid? before results" unless valid?

      budgeted_conds = Mcp::SpendingScope.budgeted_conditions
      actual_conds   = Mcp::SpendingScope.actual_conditions

      group_select   = group_select_sql
      group_by_sql   = group_by_clause_sql
      variable_cond  = variable_only ? "AND a.is_fixed_amount = false" : ""

      sql = <<~SQL
        WITH budgeted_months AS (
          SELECT #{group_select} AS grp_label,
                 to_char(b.start_date, 'YYYY-MM') AS month,
                 SUM(a.amount) AS budgeted_cents
          FROM allocations a
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b ON a.budget_id = b.id
          WHERE to_char(b.start_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
            AND b.household_id = :household_id
            AND #{budgeted_conds}
            #{variable_cond}
          GROUP BY #{group_by_sql}, to_char(b.start_date, 'YYYY-MM')
        ),
        actual_months AS (
          SELECT #{group_select} AS grp_label,
                 to_char(t.transaction_date, 'YYYY-MM') AS month,
                 SUM(t.withdrawal_amount) AS actual_cents
          FROM transactions t
          JOIN allocations a ON t.allocation_id = a.id
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          WHERE to_char(t.transaction_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
            AND t.household_id = :household_id
            AND #{actual_conds}
            #{variable_cond}
          GROUP BY #{group_by_sql}, to_char(t.transaction_date, 'YYYY-MM')
        ),
        monthly_stats AS (
          SELECT
            bm.grp_label,
            bm.month,
            bm.budgeted_cents,
            COALESCE(am.actual_cents, 0) AS actual_cents,
            ROUND(
              ABS((COALESCE(am.actual_cents, 0) - bm.budgeted_cents)::numeric / bm.budgeted_cents * 100),
              1
            ) AS abs_pct
          FROM budgeted_months bm
          LEFT JOIN actual_months am ON bm.grp_label = am.grp_label AND bm.month = am.month
          WHERE bm.budgeted_cents > 1000
        )
        SELECT
          grp_label,
          COUNT(*) AS months_counted,
          ROUND(
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY abs_pct)::numeric,
            1
          ) AS median_abs_pct_off,
          ROUND(AVG(abs_pct)::numeric, 1) AS avg_abs_pct_off,
          ROUND(
            COUNT(*) FILTER (WHERE abs_pct <= 10)::numeric / COUNT(*) * 100,
            1
          ) AS pct_months_within_10,
          CASE WHEN SUM(actual_cents - budgeted_cents) >= 0 THEN 'over' ELSE 'under' END AS direction,
          SUM(budgeted_cents) AS total_budgeted_cents,
          SUM(actual_cents) AS total_actual_cents,
          SUM(actual_cents - budgeted_cents) AS net_deviation_cents
        FROM monthly_stats
        GROUP BY grp_label
        ORDER BY #{order_clause_sql}
      SQL

      bindings = {
        start_month:  start_month,
        end_month:    end_month,
        household_id: ActsAsTenant.current_tenant.id
      }

      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, bindings])
      )

      result.map do |row|
        total_budgeted  = row["total_budgeted_cents"].to_i
        total_actual    = row["total_actual_cents"].to_i
        net_deviation   = row["net_deviation_cents"].to_i
        {
          group_label:               row["grp_label"],
          group_by:                  group_by,
          months_counted:            row["months_counted"].to_i,
          median_abs_pct_off:        row["median_abs_pct_off"].to_f,
          avg_abs_pct_off:           row["avg_abs_pct_off"].to_f,
          pct_months_within_10:      row["pct_months_within_10"].to_f,
          direction:                 row["direction"],
          total_budgeted_cents:      total_budgeted,
          total_budgeted_display:    Mcp::Money.display(total_budgeted),
          total_actual_cents:        total_actual,
          total_actual_display:      Mcp::Money.display(total_actual),
          net_deviation_cents:       net_deviation,
          net_deviation_display:     Mcp::Money.display(net_deviation)
        }
      end
    end

    private

    def end_month_not_before_start_month
      return unless start_month.match?(/\A\d{4}-\d{2}\z/) && end_month.match?(/\A\d{4}-\d{2}\z/)

      if end_month < start_month
        errors.add(
          :base,
          "end_month (#{end_month}) must not be before start_month (#{start_month})"
        )
      end
    end

    # Returns the SQL expression that produces the group label.
    # Callers must supply matching table aliases (a = allocations, ac = categories).
    def group_select_sql
      if group_by == 'allocation'
        Allocation.canonical_name_sql('a.name')
      else
        'ac.name'
      end
    end

    # Returns the SQL GROUP BY clause fragment (matching group_select_sql).
    def group_by_clause_sql
      if group_by == 'allocation'
        Allocation.canonical_name_sql('a.name')
      else
        'ac.name'
      end
    end

    def order_clause_sql
      case sort_by
      when 'pct_off'
        'median_abs_pct_off DESC'
      when 'overspend_amount'
        'net_deviation_cents DESC'
      when 'underspend_amount'
        'net_deviation_cents ASC'
      end
    end
  end
end
