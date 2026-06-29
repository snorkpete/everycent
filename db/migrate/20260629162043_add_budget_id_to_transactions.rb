class AddBudgetIdToTransactions < ActiveRecord::Migration[7.1]
  def up
    add_column :transactions, :budget_id, :integer
    add_index  :transactions, :budget_id

    # Backfill: a transaction belongs to the budget whose date-range contains it
    # (same boundary semantics as Transaction.for_budget_and_bank). Real data has
    # zero overlapping budgets, so each transaction matches at most one; null-date
    # rows and rows in budget gaps stay null.
    #
    # Correlated subquery mirrors the callback's ORDER BY start_date tie-breaking so
    # the backfill and ongoing callback produce identical results if overlaps exist.
    execute(<<~SQL)
      UPDATE transactions t
      SET budget_id = (
        SELECT b.id FROM budgets b
        WHERE b.household_id = t.household_id
          AND t.transaction_date >= b.start_date
          AND t.transaction_date <= b.end_date
        ORDER BY b.start_date
        LIMIT 1
      )
    SQL
  end

  def down
    remove_column :transactions, :budget_id
  end
end
