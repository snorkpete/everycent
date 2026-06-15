module Mcp
  # Query object for the sink_fund_status endpoint.
  #
  # Reports the current state of sink fund allocations — named reserves held in
  # accounts with account_type = 'sink_fund'. The "tier" (near-term, long-term,
  # emergency) is the bank_account.name (e.g. "Sink Fund Account",
  # "Long Term Sink Fund", "Emergency Fund Savings").
  #
  # Unlike the spending-analysis tools, this is a balances/reserve query, not a
  # period-spending-filter query. It does not share much with SpendingScope.
  #
  # Fields per row:
  #   name:               sink fund allocation name
  #   account:            tier / bank account name
  #   target_cents:       allocation amount (the target to reach)
  #   funded_cents:       total deposits into this allocation
  #   spent_cents:        total withdrawals out of this allocation
  #   remaining_cents:    target - (funded - spent) — positive = underfunded, negative = overdrawn
  #   is_overdrawn:       true when remaining_cents < 0
  #
  # Note: remaining_cents = target - current_balance, where
  # current_balance = total_deposits - total_withdrawals (net flow into the allocation).
  # A negative remaining means more has been withdrawn than the target allows — flagged
  # as overdrawn.
  class SinkFundStatus
    include ActiveModel::Validations

    attr_reader :account, :include_closed

    validate :account_is_string_or_nil

    def initialize(account: nil, include_closed: false)
      @account       = account.presence
      @include_closed = !!include_closed
    end

    # Returns one row per sink fund allocation.
    def results
      raise "Call valid? before results" unless valid?

      status_condition = include_closed ? "" : "AND sfa.status = 'open'"
      account_condition = account ? "AND ba.name = :account" : ""

      sql = <<~SQL
        SELECT
          sfa.name                                    AS name,
          ba.name                                     AS account,
          sfa.status                                  AS status,
          COALESCE(sfa.amount, 0)                     AS target_cents,
          COALESCE(SUM(t.deposit_amount),    0)       AS funded_cents,
          COALESCE(SUM(t.withdrawal_amount), 0)       AS spent_cents,
          COALESCE(SUM(t.deposit_amount),    0)
            - COALESCE(SUM(t.withdrawal_amount), 0)   AS remaining_cents
        FROM sink_fund_allocations sfa
        JOIN bank_accounts ba ON sfa.bank_account_id = ba.id
        LEFT JOIN transactions t ON t.sink_fund_allocation_id = sfa.id
        WHERE sfa.household_id = :household_id
          AND ba.account_type = 'sink_fund'
          #{status_condition}
          #{account_condition}
        GROUP BY sfa.id, sfa.name, ba.name, sfa.status, sfa.amount
        ORDER BY ba.name ASC, sfa.name ASC
      SQL

      bindings = { household_id: ActsAsTenant.current_tenant.id, account: account }
      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, bindings])
      )

      result.map do |row|
        target    = row["target_cents"].to_i
        funded    = row["funded_cents"].to_i
        spent     = row["spent_cents"].to_i
        remaining = row["remaining_cents"].to_i
        {
          name:              row["name"],
          account:           row["account"],
          status:            row["status"],
          target_cents:      target,
          target_display:    Mcp::Money.display(target),
          funded_cents:      funded,
          funded_display:    Mcp::Money.display(funded),
          spent_cents:       spent,
          spent_display:     Mcp::Money.display(spent),
          remaining_cents:   remaining,
          remaining_display: Mcp::Money.display(remaining),
          is_overdrawn:      remaining < 0
        }
      end
    end

    private

    def account_is_string_or_nil
      return if account.nil?
      return if account.is_a?(String)

      errors.add(:account, "must be a string account name or omitted")
    end
  end
end
