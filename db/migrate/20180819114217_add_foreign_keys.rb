class AddForeignKeys < ActiveRecord::Migration[5.2]
  def change


    # TODO: temporarily set to do nothing - this migrations happened on the source databases,
    # but not on the combined database
    # So, let's temporarily skip doing any work in them

    # minor data cleanups in prep for update
    # Income.where(bank_account_id: 0).update_all bank_account_id: nil
    # Transaction.where(allocation_id: 0).update_all allocation_id: nil
    # Transaction.where(sink_fund_allocation_id: 0).update_all sink_fund_allocation_id: nil


    # # add foreign keys (maybe temporary)
    # add_foreign_key "allocations", "allocation_categories", on_update: :cascade
    # add_foreign_key "allocations", "bank_accounts", on_update: :cascade
    # add_foreign_key "allocations", "budgets", on_update: :cascade

    # add_foreign_key "bank_accounts", "users", on_update: :cascade
    # add_foreign_key "bank_accounts", "institutions", on_update: :cascade

    # add_foreign_key "incomes", "budgets", on_update: :cascade
    # add_foreign_key "incomes", "bank_accounts", on_update: :cascade

    # add_foreign_key "settings", "bank_accounts", column: :primary_budget_account_id, on_update: :cascade
    #
    # add_foreign_key "sink_fund_allocations", "bank_accounts", on_update: :cascade
    # add_foreign_key "transactions", "bank_accounts", on_update: :cascade
    # add_foreign_key "transactions", "allocations", on_update: :cascade
    # add_foreign_key "transactions", "sink_fund_allocations", on_update: :cascade
  end
end
