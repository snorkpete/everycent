module Mcp
  # Shared SQL-fragment helpers for the MCP spending tools.
  #
  # Each helper returns a SQL condition string that callers interpolate into
  # their own CTEs. The caller passes table-alias kwargs so the fragments
  # work with whatever alias structure a given query uses.
  #
  # NOTE: the €10 noise floor used by BudgetAccuracy is NOT here — it is
  # accuracy-tool-specific and lives in that query object.
  module SpendingScope
    # Conditions for the budgeted-allocations side of a query.
    #
    # Filters to spending-role categories and excludes placeholder
    # allocations (budgeted at or below PLACEHOLDER_MAX_CENTS).
    #
    # @param allocation_alias [String] SQL alias for the allocations table (e.g. 'a')
    # @param category_alias   [String] SQL alias for the allocation_categories table (e.g. 'ac')
    # @return [String] SQL fragment suitable for use in a WHERE clause
    def self.budgeted_conditions(allocation_alias: 'a', category_alias: 'ac')
      non_placeholder = Allocation.non_placeholder_amount_sql("#{allocation_alias}.amount")
      "#{category_alias}.budget_role = 'spending'\n          AND #{non_placeholder}"
    end

    # Conditions for the actual-transactions side of a query.
    #
    # Excludes manual adjustments, deposits, brought-forward credit card
    # entries, and transactions against placeholder allocations.
    #
    # @param txn_alias        [String] SQL alias for the transactions table (e.g. 't')
    # @param allocation_alias [String] SQL alias for the allocations table (e.g. 'a')
    # @param category_alias   [String] SQL alias for the allocation_categories table (e.g. 'ac')
    # @return [String] SQL fragment suitable for use in a WHERE clause
    def self.actual_conditions(txn_alias: 't', allocation_alias: 'a', category_alias: 'ac')
      non_placeholder = Allocation.non_placeholder_amount_sql("#{allocation_alias}.amount")
      "#{txn_alias}.is_manual_adjustment = false\n          AND #{txn_alias}.withdrawal_amount > 0\n          AND (#{txn_alias}.brought_forward_status IS NULL\n               OR #{txn_alias}.brought_forward_status NOT IN ('added', 'adjustment'))\n          AND #{category_alias}.budget_role = 'spending'\n          AND #{non_placeholder}"
    end
  end
end
