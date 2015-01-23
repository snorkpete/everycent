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

ActiveRecord::Schema.define(version: 20150123181857) do

  create_table "allocation_categories", force: true do |t|
    t.string   "name"
    t.integer  "percentage"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "allocations", force: true do |t|
    t.string   "name"
    t.integer  "amount"
    t.integer  "budget_id"
    t.integer  "allocation_category_id"
    t.string   "allocation_type"
    t.boolean  "is_standing_order"
    t.integer  "bank_account_id"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "bank_accounts", force: true do |t|
    t.string   "name"
    t.string   "account_type"
    t.string   "account_no"
    t.integer  "user_id"
    t.integer  "institution_id"
    t.integer  "opening_balance"
    t.integer  "current_balance"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "budgets", force: true do |t|
    t.string   "name"
    t.date     "start_date"
    t.date     "end_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "incomes", force: true do |t|
    t.string   "name"
    t.integer  "amount"
    t.integer  "budget_id"
    t.integer  "bank_account_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "institutions", force: true do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payees", force: true do |t|
    t.string   "name"
    t.string   "code"
    t.string   "default_allocation_name"
    t.string   "status"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  create_table "recurring_allocations", force: true do |t|
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

  create_table "recurring_incomes", force: true do |t|
    t.string   "name"
    t.integer  "amount"
    t.string   "frequency",       default: "monthly"
    t.integer  "bank_account_id"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
  end

  create_table "transactions", force: true do |t|
    t.string   "description"
    t.string   "bank_ref"
    t.integer  "bank_account_id"
    t.date     "transaction_date"
    t.integer  "withdrawal_amount"
    t.integer  "deposit_amount"
    t.integer  "payee_id"
    t.integer  "allocation_id"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
  end

  create_table "users", force: true do |t|
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

  add_index "users", ["email"], name: "index_users_on_email"
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  add_index "users", ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true

end
