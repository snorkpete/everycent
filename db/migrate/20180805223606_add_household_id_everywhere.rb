class AddHouseholdIdEverywhere < ActiveRecord::Migration[5.2]
  def change

    household_id = Household.first.id

    # for each table, add the household ID column,
    # add an index on the column for faster searching (this column will be used in EVERY query)
    # and update any existing data to use the same randomly generated household id
    # add_reference :uploads, :user, index: true
    # add_foreign_key :uploads, :users

    add_reference :allocation_categories, :household, index: true
    AllocationCategory.update_all household_id: household_id
    add_foreign_key :allocation_categories, :households, on_update: :cascade

    add_reference :allocations, :household, index: true
    Allocation.update_all household_id: household_id
    add_foreign_key :allocations, :households, on_update: :cascade

    add_reference :bank_accounts, :household, index: true
    BankAccount.update_all household_id: household_id
    add_foreign_key :bank_accounts, :households, on_update: :cascade

    add_reference :budgets, :household, index: true
    Budget.update_all household_id: household_id
    add_foreign_key :budgets, :households, on_update: :cascade

    add_reference :incomes, :household, index: true
    Income.update_all household_id: household_id
    add_foreign_key :incomes, :households, on_update: :cascade

    add_reference :institutions, :household, index: true
    Institution.update_all household_id: household_id
    add_foreign_key :institutions, :households, on_update: :cascade

    # add_reference :payees, :household, index: true
    # Payee.update_all household_id: household_id
    # add_foreign_key :payees, :households
    #
    # add_reference :recurring_allocations, :household, index: true
    # RecurringAllocation.update_all household_id: household_id
    # add_foreign_key :recurring_allocations, :households
    #
    # add_reference :recurring_incomes, :household, index: true
    # RecurringIncome.update_all household_id: household_id
    # add_foreign_key :recurring_incomes, :households

    add_reference :settings, :household, index: true
    Setting.update_all household_id: household_id
    add_foreign_key :settings, :households, on_update: :cascade

    add_reference :sink_fund_allocations, :household, index: true
    SinkFundAllocation.update_all household_id: household_id
    add_foreign_key :sink_fund_allocations, :households, on_update: :cascade

    add_reference :transactions, :household, index: true
    Transaction.update_all household_id: household_id
    add_foreign_key :transactions, :households, on_update: :cascade

    add_reference :users, :household, index: true
    User.update_all household_id: household_id
    add_foreign_key :users, :households, on_update: :cascade

    # also add the admin column
    add_column :users, :admin, :boolean, default: false
    User.update_all admin: false
  end
end
