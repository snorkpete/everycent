module Mcp
  # Query object for the placeholder_allocation_analysis endpoint.
  #
  # This tool INVERTS the usual filter: placeholders are the SUBJECT, not excluded.
  # A placeholder allocation is one budgeted at <= PLACEHOLDER_MAX_CENTS (10 cents,
  # i.e. 0.01–0.10 EUR). These represent expenses funded from sink funds rather than
  # current budget income. The question is: how much spending rides on saved money?
  #
  # Threshold is single-sourced via Allocation::PLACEHOLDER_MAX_CENTS (= 10).
  # The condition for placeholder allocations is the complement of
  # Allocation.non_placeholder_amount_sql — i.e. amount <= PLACEHOLDER_MAX_CENTS.
  #
  # Bookkeeping gates:
  # - Excludes brought-forward transactions (brought_forward_status IN ('added','adjustment'))
  # - Excludes manual adjustments
  # - Scopes to the budget months within start_month..end_month
  # - Keeps placeholder allocations only (inverted filter)
  class PlaceholderAllocationAnalysis
    include ActiveModel::Validations

    attr_reader :start_month, :end_month

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

    def initialize(start_month:, end_month:)
      @start_month = start_month
      @end_month   = end_month
    end

    # Returns a hash with three keys:
    #   :monthly_summary — per-budget-month count, % placeholders, total spend
    #   :top_placeholders — placeholder allocations ranked by total spend
    def results
      raise "Call valid? before results" unless valid?

      {
        monthly_summary:  monthly_summary_results,
        top_placeholders: top_placeholder_results
      }
    end

    private

    # Returns per-month stats: how many placeholder allocations exist, what fraction
    # of total allocations they represent, and how much spending flows through them.
    def monthly_summary_results
      sql = <<~SQL
        WITH all_allocations AS (
          SELECT
            to_char(b.start_date, 'YYYY-MM') AS month,
            COUNT(*)                          AS total_allocation_count
          FROM allocations a
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b                ON a.budget_id = b.id
          WHERE b.household_id = :household_id
            AND to_char(b.start_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
          GROUP BY to_char(b.start_date, 'YYYY-MM')
        ),
        placeholder_spend AS (
          SELECT
            to_char(b.start_date, 'YYYY-MM') AS month,
            COUNT(DISTINCT a.id)              AS placeholder_count,
            COALESCE(SUM(t.withdrawal_amount), 0) AS spend_cents
          FROM allocations a
          JOIN allocation_categories ac ON a.allocation_category_id = ac.id
          JOIN budgets b                ON a.budget_id = b.id
          LEFT JOIN transactions t
            ON t.allocation_id = a.id
            AND t.is_manual_adjustment = false
            AND t.withdrawal_amount > 0
            AND (t.brought_forward_status IS NULL
                 OR t.brought_forward_status NOT IN ('added', 'adjustment'))
          WHERE b.household_id = :household_id
            AND to_char(b.start_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
            AND #{placeholder_condition}
          GROUP BY to_char(b.start_date, 'YYYY-MM')
        )
        SELECT
          aa.month,
          aa.total_allocation_count,
          COALESCE(ps.placeholder_count, 0)  AS placeholder_count,
          COALESCE(ps.spend_cents, 0)         AS spend_cents,
          CASE
            WHEN aa.total_allocation_count = 0 THEN 0.0
            ELSE ROUND(
              COALESCE(ps.placeholder_count, 0)::numeric
                / aa.total_allocation_count * 100,
              1
            )
          END AS placeholder_pct
        FROM all_allocations aa
        LEFT JOIN placeholder_spend ps ON aa.month = ps.month
        ORDER BY aa.month ASC
      SQL

      execute_and_map(sql) do |row|
        spend = row["spend_cents"].to_i
        {
          month:                    row["month"],
          total_allocation_count:   row["total_allocation_count"].to_i,
          placeholder_count:        row["placeholder_count"].to_i,
          placeholder_pct:          row["placeholder_pct"].to_f,
          spend_cents:              spend,
          spend_display:            Mcp::Money.display(spend)
        }
      end
    end

    # Returns placeholder allocations ranked by total spend across the date range.
    def top_placeholder_results
      sql = <<~SQL
        SELECT
          #{Allocation.canonical_name_sql('a.name')}  AS allocation_name,
          ac.name                                      AS category_name,
          COUNT(DISTINCT to_char(b.start_date, 'YYYY-MM')) AS months_appeared,
          COALESCE(SUM(t.withdrawal_amount), 0)        AS total_spend_cents
        FROM allocations a
        JOIN allocation_categories ac ON a.allocation_category_id = ac.id
        JOIN budgets b                ON a.budget_id = b.id
        LEFT JOIN transactions t
          ON t.allocation_id = a.id
          AND t.is_manual_adjustment = false
          AND t.withdrawal_amount > 0
          AND (t.brought_forward_status IS NULL
               OR t.brought_forward_status NOT IN ('added', 'adjustment'))
        WHERE b.household_id = :household_id
          AND to_char(b.start_date, 'YYYY-MM') BETWEEN :start_month AND :end_month
          AND #{placeholder_condition}
        GROUP BY #{Allocation.canonical_name_sql('a.name')}, ac.name
        ORDER BY total_spend_cents DESC
      SQL

      execute_and_map(sql) do |row|
        total = row["total_spend_cents"].to_i
        {
          allocation_name:     row["allocation_name"],
          category_name:       row["category_name"],
          months_appeared:     row["months_appeared"].to_i,
          total_spend_cents:   total,
          total_spend_display: Mcp::Money.display(total)
        }
      end
    end

    def execute_and_map(sql, &block)
      bindings = {
        start_month:  start_month,
        end_month:    end_month,
        household_id: ActsAsTenant.current_tenant.id
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

    # SQL condition selecting placeholder allocations only.
    # Threshold is single-sourced via Allocation::PLACEHOLDER_MAX_CENTS.
    def placeholder_condition
      "a.amount <= #{Allocation::PLACEHOLDER_MAX_CENTS}"
    end
  end
end
