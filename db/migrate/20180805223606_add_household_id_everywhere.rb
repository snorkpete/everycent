class AddHouseholdIdEverywhere < ActiveRecord::Migration[5.2]
  def change

    household_id = Household.first.id

    # for each table, add the household ID column,
    # add an index on the column for faster searching (this column will be used in EVERY query)
    # and update any existing data to use the same randomly generated household id
    # add_reference :uploads, :user, index: true
    # add_foreign_key :uploads, :users

    add_reference :allocation_categories, :household, index: true
    add_foreign_key :allocation_categories, :households
    AllocationCategory.update_all household_id: household_id

    add_reference :allocations, :household, index: true
    add_foreign_key :allocations, :households
    Allocation.update_all household_id: household_id

    add_reference :bank_accounts, :household, index: true
    add_foreign_key :bank_accounts, :households
    BankAccount.update_all household_id: household_id

    add_reference :budgets, :household, index: true
    add_foreign_key :budgets, :households
    Budget.update_all household_id: household_id

    add_reference :incomes, :household, index: true
    add_foreign_key :incomes, :households
    Income.update_all household_id: household_id

    add_reference :institutions, :household, index: true
    add_foreign_key :institutions, :households
    Institution.update_all household_id: household_id

    add_reference :payees, :household, index: true
    add_foreign_key :payees, :households
    Payee.update_all household_id: household_id

    add_reference :recurring_allocations, :household, index: true
    add_foreign_key :recurring_allocations, :households
    RecurringAllocation.update_all household_id: household_id

    add_reference :recurring_incomes, :household, index: true
    add_foreign_key :recurring_incomes, :households
    RecurringIncome.update_all household_id: household_id

    add_reference :settings, :household, index: true
    add_foreign_key :settings, :households
    Setting.update_all household_id: household_id

    add_reference :sink_fund_allocations, :household, index: true
    add_foreign_key :sink_fund_allocations, :households
    SinkFundAllocation.update_all household_id: household_id

    add_reference :transactions, :household, index: true
    add_foreign_key :transactions, :households
    Transaction.update_all household_id: household_id

    add_reference :users, :household, index: true
    add_foreign_key :users, :households
    User.update_all household_id: household_id

    # also add the admin column
    add_column :users, :admin, :boolean, default: false
    User.update_all admin: false
  end
end
