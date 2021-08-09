# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_08_08_201915) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "allocation_categories", id: :serial, force: :cascade do |t|
    t.string "name"
    t.integer "percentage"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "household_id"
    t.index ["household_id"], name: "index_allocation_categories_on_household_id"
  end

  create_table "allocations", id: :serial, force: :cascade do |t|
    t.string "name"
    t.integer "amount"
    t.integer "budget_id"
    t.integer "allocation_category_id"
    t.string "allocation_type"
    t.boolean "is_standing_order"
    t.integer "bank_account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "comment"
    t.bigint "household_id"
    t.string "allocation_class", default: "want"
    t.boolean "is_fixed_amount", default: false
    t.boolean "is_cumulative", default: false
    t.index ["allocation_category_id"], name: "index_allocations_on_allocation_category_id"
    t.index ["bank_account_id"], name: "index_allocations_on_bank_account_id"
    t.index ["budget_id"], name: "index_allocations_on_budget_id"
    t.index ["household_id"], name: "index_allocations_on_household_id"
    t.index ["name"], name: "index_allocations_on_name"
  end

  create_table "bank_accounts", id: :serial, force: :cascade do |t|
    t.string "name"
    t.string "account_type_description"
    t.string "account_no"
    t.integer "user_id"
    t.integer "institution_id"
    t.integer "opening_balance"
    t.integer "closing_balance"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "closing_date"
    t.string "account_category", default: "asset"
    t.boolean "allow_default_allocations", default: false
    t.integer "default_sub_account_amount", default: 0
    t.string "status", default: "open"
    t.string "account_type", default: "normal"
    t.integer "statement_day"
    t.integer "payment_due_day"
    t.boolean "is_cash", default: true
    t.string "import_format", default: ""
    t.bigint "household_id"
    t.index ["household_id"], name: "index_bank_accounts_on_household_id"
    t.index ["institution_id"], name: "index_bank_accounts_on_institution_id"
    t.index ["user_id"], name: "index_bank_accounts_on_user_id"
  end

  create_table "budgets", id: :serial, force: :cascade do |t|
    t.string "name"
    t.date "start_date"
    t.date "end_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "status", default: "open"
    t.bigint "household_id"
    t.index ["household_id"], name: "index_budgets_on_household_id"
    t.index ["start_date"], name: "index_budgets_on_start_date"
  end

  create_table "households", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "incomes", id: :serial, force: :cascade do |t|
    t.string "name"
    t.integer "amount"
    t.integer "budget_id"
    t.integer "bank_account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "comment"
    t.bigint "household_id"
    t.index ["bank_account_id"], name: "index_incomes_on_bank_account_id"
    t.index ["budget_id"], name: "index_incomes_on_budget_id"
    t.index ["household_id"], name: "index_incomes_on_household_id"
  end

  create_table "institutions", id: :serial, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "household_id"
    t.index ["household_id"], name: "index_institutions_on_household_id"
  end

  create_table "payees", id: :serial, force: :cascade do |t|
    t.string "name"
    t.string "code"
    t.string "default_allocation_name"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_payees_on_code"
  end

  create_table "recurring_allocations", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.integer "amount"
    t.integer "allocation_category_id"
    t.string "frequency", default: "monthly"
    t.string "allocation_type", default: "expense"
    t.boolean "is_standing_order"
    t.integer "bank_account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["allocation_category_id"], name: "index_recurring_allocations_on_allocation_category_id"
    t.index ["bank_account_id"], name: "index_recurring_allocations_on_bank_account_id"
  end

  create_table "recurring_incomes", id: :serial, force: :cascade do |t|
    t.string "name"
    t.integer "amount"
    t.string "frequency", default: "monthly"
    t.integer "bank_account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bank_account_id"], name: "index_recurring_incomes_on_bank_account_id"
  end

  create_table "settings", id: :serial, force: :cascade do |t|
    t.integer "primary_budget_account_id"
    t.string "bank_charges_allocation_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "husband", default: "Husband"
    t.string "wife", default: "Wife"
    t.string "family_type", default: "couple"
    t.string "single_person"
    t.bigint "household_id"
    t.index ["household_id"], name: "index_settings_on_household_id"
  end

  create_table "sink_fund_allocations", id: :serial, force: :cascade do |t|
    t.string "name"
    t.integer "bank_account_id"
    t.integer "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "comment"
    t.string "status", default: "open"
    t.bigint "household_id"
    t.index ["bank_account_id"], name: "index_sink_fund_allocations_on_bank_account_id"
    t.index ["household_id"], name: "index_sink_fund_allocations_on_household_id"
  end

  create_table "transactions", id: :serial, force: :cascade do |t|
    t.string "description"
    t.string "bank_ref"
    t.integer "bank_account_id"
    t.date "transaction_date"
    t.integer "withdrawal_amount", default: 0
    t.integer "deposit_amount", default: 0
    t.integer "payee_id"
    t.integer "allocation_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "payee_code"
    t.string "payee_name"
    t.integer "sink_fund_allocation_id"
    t.string "status"
    t.string "brought_forward_status"
    t.bigint "household_id"
    t.boolean "is_manual_adjustment", default: false
    t.index ["allocation_id"], name: "index_transactions_on_allocation_id"
    t.index ["bank_account_id"], name: "index_transactions_on_bank_account_id"
    t.index ["household_id"], name: "index_transactions_on_household_id"
    t.index ["transaction_date"], name: "index_transactions_on_transaction_date"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "provider", null: false
    t.string "uid", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "first_name"
    t.string "last_name"
    t.string "nickname"
    t.string "image"
    t.string "email"
    t.text "tokens"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.bigint "household_id"
    t.boolean "admin", default: false
    t.index ["email"], name: "index_users_on_email"
    t.index ["household_id"], name: "index_users_on_household_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
  end

  add_foreign_key "allocation_categories", "households", on_update: :cascade
  add_foreign_key "allocations", "households", on_update: :cascade
  add_foreign_key "bank_accounts", "households", on_update: :cascade
  add_foreign_key "budgets", "households", on_update: :cascade
  add_foreign_key "incomes", "households", on_update: :cascade
  add_foreign_key "institutions", "households", on_update: :cascade
  add_foreign_key "settings", "households", on_update: :cascade
  add_foreign_key "sink_fund_allocations", "households", on_update: :cascade
  add_foreign_key "transactions", "households", on_update: :cascade
  add_foreign_key "users", "households", on_update: :cascade
end
