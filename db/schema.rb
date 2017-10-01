# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20171001175254) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "allocation_categories", force: :cascade do |t|
    t.string   "name"
    t.integer  "percentage"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "allocations", force: :cascade do |t|
    t.string   "name"
    t.integer  "amount"
    t.integer  "budget_id"
    t.integer  "allocation_category_id"
    t.string   "allocation_type"
    t.boolean  "is_standing_order"
    t.integer  "bank_account_id"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.string   "comment"
  end

  add_index "allocations", ["allocation_category_id"], name: "index_allocations_on_allocation_category_id", using: :btree
  add_index "allocations", ["bank_account_id"], name: "index_allocations_on_bank_account_id", using: :btree
  add_index "allocations", ["budget_id"], name: "index_allocations_on_budget_id", using: :btree
  add_index "allocations", ["name"], name: "index_allocations_on_name", using: :btree

  create_table "bank_accounts", force: :cascade do |t|
    t.string   "name"
    t.string   "account_type_description"
    t.string   "account_no"
    t.integer  "user_id"
    t.integer  "institution_id"
    t.integer  "opening_balance"
    t.integer  "closing_balance"
    t.datetime "created_at",                                    null: false
    t.datetime "updated_at",                                    null: false
    t.date     "closing_date"
    t.string   "account_category",           default: "asset"
    t.boolean  "allow_default_allocations",  default: false
    t.integer  "default_sub_account_amount", default: 0
    t.string   "status",                     default: "open"
    t.string   "account_type",               default: "normal"
    t.integer  "statement_day"
    t.integer  "payment_due_day"
    t.boolean  "is_cash",                    default: true
  end

  add_index "bank_accounts", ["institution_id"], name: "index_bank_accounts_on_institution_id", using: :btree
  add_index "bank_accounts", ["user_id"], name: "index_bank_accounts_on_user_id", using: :btree

  create_table "budgets", force: :cascade do |t|
    t.string   "name"
    t.date     "start_date"
    t.date     "end_date"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.string   "status",     default: "open"
  end

  add_index "budgets", ["start_date"], name: "index_budgets_on_start_date", using: :btree

  create_table "incomes", force: :cascade do |t|
    t.string   "name"
    t.integer  "amount"
    t.integer  "budget_id"
    t.integer  "bank_account_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.string   "comment"
  end

  add_index "incomes", ["bank_account_id"], name: "index_incomes_on_bank_account_id", using: :btree
  add_index "incomes", ["budget_id"], name: "index_incomes_on_budget_id", using: :btree

  create_table "institutions", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payees", force: :cascade do |t|
    t.string   "name"
    t.string   "code"
    t.string   "default_allocation_name"
    t.string   "status"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  add_index "payees", ["code"], name: "index_payees_on_code", using: :btree

  create_table "recurring_allocations", force: :cascade do |t|
    t.string   "name",                                       null: false
    t.integer  "amount"
    t.integer  "allocation_category_id"
    t.string   "frequency",              default: "monthly"
    t.string   "allocation_type",        default: "expense"
    t.boolean  "is_standing_order"
    t.integer  "bank_account_id"
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
  end

  add_index "recurring_allocations", ["allocation_category_id"], name: "index_recurring_allocations_on_allocation_category_id", using: :btree
  add_index "recurring_allocations", ["bank_account_id"], name: "index_recurring_allocations_on_bank_account_id", using: :btree

  create_table "recurring_incomes", force: :cascade do |t|
    t.string   "name"
    t.integer  "amount"
    t.string   "frequency",       default: "monthly"
    t.integer  "bank_account_id"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
  end

  add_index "recurring_incomes", ["bank_account_id"], name: "index_recurring_incomes_on_bank_account_id", using: :btree

  create_table "settings", force: :cascade do |t|
    t.integer  "primary_budget_account_id"
    t.string   "bank_charges_allocation_name"
    t.datetime "created_at",                                       null: false
    t.datetime "updated_at",                                       null: false
    t.string   "husband",                      default: "Husband"
    t.string   "wife",                         default: "Wife"
  end

  create_table "sink_fund_allocations", force: :cascade do |t|
    t.string   "name"
    t.integer  "bank_account_id"
    t.integer  "amount"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.string   "comment"
    t.string   "status",          default: "open"
  end

  add_index "sink_fund_allocations", ["bank_account_id"], name: "index_sink_fund_allocations_on_bank_account_id", using: :btree

  create_table "transactions", force: :cascade do |t|
    t.string   "description"
    t.string   "bank_ref"
    t.integer  "bank_account_id"
    t.date     "transaction_date"
    t.integer  "withdrawal_amount"
    t.integer  "deposit_amount"
    t.integer  "payee_id"
    t.integer  "allocation_id"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "payee_code"
    t.string   "payee_name"
    t.integer  "sink_fund_allocation_id"
    t.string   "status"
    t.string   "brought_forward_status"
  end

  add_index "transactions", ["allocation_id"], name: "index_transactions_on_allocation_id", using: :btree
  add_index "transactions", ["bank_account_id"], name: "index_transactions_on_bank_account_id", using: :btree
  add_index "transactions", ["transaction_date"], name: "index_transactions_on_transaction_date", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "provider",                            null: false
    t.string   "uid",                    default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "nickname"
    t.string   "image"
    t.string   "email"
    t.text     "tokens"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["email"], name: "index_users_on_email", using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  add_index "users", ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true, using: :btree

end
