# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_29_162043) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_stat_statements"

  create_table "allocation_categories", id: :serial, force: :cascade do |t|
    t.string "budget_role", default: "spending", null: false
    t.datetime "created_at", precision: nil, null: false
    t.bigint "household_id"
    t.string "name"
    t.integer "percentage"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["household_id"], name: "index_allocation_categories_on_household_id"
  end

  create_table "allocations", id: :serial, force: :cascade do |t|
    t.integer "allocation_category_id"
    t.string "allocation_class", default: "want", null: false
    t.string "allocation_type"
    t.integer "amount"
    t.integer "bank_account_id"
    t.integer "budget_id"
    t.string "comment"
    t.datetime "created_at", precision: nil, null: false
    t.bigint "household_id"
    t.boolean "is_cumulative", default: false
    t.boolean "is_fixed_amount", default: false
    t.boolean "is_standing_order"
    t.string "name"
    t.bigint "special_event_id"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["allocation_category_id"], name: "index_allocations_on_allocation_category_id"
    t.index ["bank_account_id"], name: "index_allocations_on_bank_account_id"
    t.index ["budget_id"], name: "index_allocations_on_budget_id"
    t.index ["household_id"], name: "index_allocations_on_household_id"
    t.index ["name"], name: "index_allocations_on_name"
    t.index ["special_event_id"], name: "index_allocations_on_special_event_id"
  end

  create_table "bank_accounts", id: :serial, force: :cascade do |t|
    t.string "account_category", default: "asset"
    t.string "account_no"
    t.string "account_type", default: "normal"
    t.string "account_type_description"
    t.boolean "allow_default_allocations", default: false
    t.integer "asset_bank_account_id"
    t.integer "closing_balance"
    t.date "closing_date"
    t.datetime "created_at", precision: nil, null: false
    t.integer "default_sub_account_amount", default: 0
    t.bigint "household_id"
    t.string "import_format", default: ""
    t.integer "institution_id"
    t.boolean "is_cash", default: true
    t.string "name"
    t.integer "opening_balance"
    t.integer "payment_due_day"
    t.integer "statement_day"
    t.string "status", default: "open"
    t.datetime "updated_at", precision: nil, null: false
    t.integer "user_id"
    t.index ["asset_bank_account_id"], name: "index_bank_accounts_on_asset_bank_account_id"
    t.index ["household_id"], name: "index_bank_accounts_on_household_id"
    t.index ["institution_id"], name: "index_bank_accounts_on_institution_id"
    t.index ["user_id"], name: "index_bank_accounts_on_user_id"
  end

  create_table "budgets", id: :serial, force: :cascade do |t|
    t.datetime "created_at", precision: nil, null: false
    t.date "end_date"
    t.bigint "household_id"
    t.string "name"
    t.date "start_date"
    t.string "status", default: "open"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["household_id"], name: "index_budgets_on_household_id"
    t.index ["start_date"], name: "index_budgets_on_start_date"
  end

  create_table "bug_reports", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.bigint "household_id", null: false
    t.bigint "reporter_id", null: false
    t.string "status", default: "open", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["household_id", "created_at"], name: "index_bug_reports_on_household_id_and_created_at"
    t.index ["household_id"], name: "index_bug_reports_on_household_id"
    t.index ["reporter_id"], name: "index_bug_reports_on_reporter_id"
  end

  create_table "chat_settings", force: :cascade do |t|
    t.boolean "chat_enabled", default: false, null: false
    t.datetime "created_at", null: false
    t.jsonb "extras", default: {}, null: false
    t.bigint "household_id", null: false
    t.bigint "llm_model_id"
    t.integer "max_tool_iterations", default: 5, null: false
    t.datetime "updated_at", null: false
    t.index ["household_id"], name: "index_chat_settings_on_household_id"
    t.index ["llm_model_id"], name: "index_chat_settings_on_llm_model_id"
  end

  create_table "conversation_turn_steps", force: :cascade do |t|
    t.uuid "conversation_turn_id", null: false
    t.datetime "created_at", null: false
    t.bigint "household_id", null: false
    t.integer "step_index", null: false
    t.text "thinking"
    t.jsonb "tool_calls", default: [], null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_turn_id", "step_index"], name: "index_conversation_turn_steps_on_turn_id_and_step_index", unique: true
    t.index ["conversation_turn_id"], name: "index_conversation_turn_steps_on_conversation_turn_id"
    t.index ["household_id", "created_at"], name: "index_conversation_turn_steps_on_household_id_and_created_at"
    t.index ["household_id"], name: "index_conversation_turn_steps_on_household_id"
  end

  create_table "conversation_turns", force: :cascade do |t|
    t.uuid "conversation_id", null: false
    t.uuid "conversation_turn_id", null: false
    t.datetime "created_at", null: false
    t.text "final_output"
    t.bigint "household_id", null: false
    t.boolean "incomplete", default: false, null: false
    t.datetime "updated_at", null: false
    t.text "user_prompt", null: false
    t.index ["conversation_id"], name: "index_conversation_turns_on_conversation_id"
    t.index ["conversation_turn_id"], name: "index_conversation_turns_on_conversation_turn_id", unique: true
    t.index ["household_id", "created_at"], name: "index_conversation_turns_on_household_id_and_created_at"
    t.index ["household_id"], name: "index_conversation_turns_on_household_id"
  end

  create_table "households", force: :cascade do |t|
    t.datetime "created_at", precision: nil, null: false
    t.string "name"
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "incomes", id: :serial, force: :cascade do |t|
    t.integer "amount"
    t.integer "bank_account_id"
    t.integer "budget_id"
    t.string "comment"
    t.datetime "created_at", precision: nil, null: false
    t.bigint "household_id"
    t.string "name"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["bank_account_id"], name: "index_incomes_on_bank_account_id"
    t.index ["budget_id"], name: "index_incomes_on_budget_id"
    t.index ["household_id"], name: "index_incomes_on_household_id"
  end

  create_table "institutions", id: :serial, force: :cascade do |t|
    t.datetime "created_at", precision: nil, null: false
    t.bigint "household_id"
    t.string "name"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["household_id"], name: "index_institutions_on_household_id"
  end

  create_table "llm_models", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.decimal "cache_read_token_cost", precision: 10, scale: 4, default: "0.0", null: false
    t.decimal "cache_write_token_cost", precision: 10, scale: 4, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.string "display_name"
    t.bigint "household_id", null: false
    t.decimal "input_token_cost", precision: 10, scale: 4, default: "0.0", null: false
    t.string "name", null: false
    t.decimal "output_token_cost", precision: 10, scale: 4, default: "0.0", null: false
    t.string "provider", null: false
    t.decimal "thinking_token_cost", precision: 10, scale: 4, default: "0.0", null: false
    t.datetime "updated_at", null: false
    t.string "url", null: false
    t.index ["household_id", "provider", "name"], name: "index_llm_models_on_household_id_and_provider_and_name", unique: true
    t.index ["household_id"], name: "index_llm_models_on_household_id"
  end

  create_table "llm_usage_records", force: :cascade do |t|
    t.decimal "cache_read_token_cost_rate", precision: 10, scale: 4, default: "0.0", null: false
    t.integer "cache_read_tokens", default: 0, null: false
    t.decimal "cache_write_token_cost_rate", precision: 10, scale: 4, default: "0.0", null: false
    t.integer "cache_write_tokens", default: 0, null: false
    t.uuid "conversation_id", null: false
    t.uuid "conversation_turn_id", null: false
    t.datetime "created_at", null: false
    t.jsonb "extras", default: {}, null: false
    t.bigint "household_id", null: false
    t.boolean "incomplete", default: false, null: false
    t.decimal "input_token_cost_rate", precision: 10, scale: 4, default: "0.0", null: false
    t.integer "input_tokens", default: 0, null: false
    t.bigint "llm_model_id", null: false
    t.string "llm_model_name", null: false
    t.decimal "output_token_cost_rate", precision: 10, scale: 4, default: "0.0", null: false
    t.integer "output_tokens", default: 0, null: false
    t.string "provider", null: false
    t.integer "request_duration_ms", default: 0, null: false
    t.integer "step_index", default: 0, null: false
    t.decimal "thinking_token_cost_rate", precision: 10, scale: 4, default: "0.0", null: false
    t.integer "thinking_tokens", default: 0, null: false
    t.integer "tool_call_count", default: 0, null: false
    t.jsonb "tool_calls_detail", default: [], null: false
    t.decimal "total_cost", precision: 12, scale: 4, default: "0.0", null: false
    t.integer "total_tokens", default: 0, null: false
    t.datetime "updated_at", null: false
    t.string "usage_category", null: false
    t.index ["conversation_id"], name: "index_llm_usage_records_on_conversation_id"
    t.index ["conversation_turn_id", "step_index"], name: "index_llm_usage_records_on_turn_id_and_step_index", unique: true
    t.index ["conversation_turn_id"], name: "index_llm_usage_records_on_conversation_turn_id"
    t.index ["household_id", "created_at"], name: "index_llm_usage_records_on_household_id_and_created_at"
    t.index ["household_id"], name: "index_llm_usage_records_on_household_id"
    t.index ["llm_model_id"], name: "index_llm_usage_records_on_llm_model_id"
  end

  create_table "payees", id: :serial, force: :cascade do |t|
    t.string "code"
    t.datetime "created_at", precision: nil, null: false
    t.string "default_allocation_name"
    t.string "name"
    t.string "status"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["code"], name: "index_payees_on_code"
  end

  create_table "recurring_allocations", id: :serial, force: :cascade do |t|
    t.integer "allocation_category_id"
    t.string "allocation_type", default: "expense"
    t.integer "amount"
    t.integer "bank_account_id"
    t.datetime "created_at", precision: nil, null: false
    t.string "frequency", default: "monthly"
    t.boolean "is_standing_order"
    t.string "name", null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["allocation_category_id"], name: "index_recurring_allocations_on_allocation_category_id"
    t.index ["bank_account_id"], name: "index_recurring_allocations_on_bank_account_id"
  end

  create_table "recurring_incomes", id: :serial, force: :cascade do |t|
    t.integer "amount"
    t.integer "bank_account_id"
    t.datetime "created_at", precision: nil, null: false
    t.string "frequency", default: "monthly"
    t.string "name"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["bank_account_id"], name: "index_recurring_incomes_on_bank_account_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "ip_address"
    t.datetime "last_active_at"
    t.string "token_digest", null: false
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["token_digest"], name: "index_sessions_on_token_digest", unique: true
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "settings", id: :serial, force: :cascade do |t|
    t.string "bank_charges_allocation_name"
    t.datetime "created_at", precision: nil, null: false
    t.integer "default_allocation_category_id_for_special_events"
    t.string "family_type", default: "couple"
    t.bigint "household_id"
    t.string "husband", default: "Husband"
    t.integer "primary_budget_account_id"
    t.string "single_person"
    t.datetime "updated_at", precision: nil, null: false
    t.string "wife", default: "Wife"
    t.index ["household_id"], name: "index_settings_on_household_id"
  end

  create_table "sink_fund_allocations", id: :serial, force: :cascade do |t|
    t.integer "amount"
    t.integer "bank_account_id"
    t.string "comment"
    t.datetime "created_at", precision: nil, null: false
    t.bigint "household_id"
    t.string "name"
    t.string "status", default: "open"
    t.datetime "updated_at", precision: nil, null: false
    t.index ["bank_account_id"], name: "index_sink_fund_allocations_on_bank_account_id"
    t.index ["household_id"], name: "index_sink_fund_allocations_on_household_id"
  end

  create_table "special_events", force: :cascade do |t|
    t.integer "actual_amount", default: 0, null: false
    t.integer "budget_amount", default: 0, null: false
    t.datetime "created_at", null: false
    t.bigint "household_id", null: false
    t.string "name"
    t.date "start_date"
    t.datetime "updated_at", null: false
    t.index ["household_id"], name: "index_special_events_on_household_id"
  end

  create_table "transactions", id: :serial, force: :cascade do |t|
    t.integer "allocation_id"
    t.integer "bank_account_id"
    t.string "bank_ref"
    t.string "brought_forward_status"
    t.integer "budget_id"
    t.boolean "camt_imported", default: false
    t.datetime "created_at", precision: nil, null: false
    t.integer "deposit_amount", default: 0
    t.string "description"
    t.bigint "household_id"
    t.boolean "is_manual_adjustment", default: false
    t.string "payee_code"
    t.integer "payee_id"
    t.string "payee_name"
    t.integer "sink_fund_allocation_id"
    t.string "status"
    t.date "transaction_date"
    t.datetime "updated_at", precision: nil, null: false
    t.integer "withdrawal_amount", default: 0
    t.index ["allocation_id"], name: "index_transactions_on_allocation_id"
    t.index ["bank_account_id", "bank_ref"], name: "index_transactions_on_bank_account_id_and_bank_ref", unique: true
    t.index ["bank_account_id"], name: "index_transactions_on_bank_account_id"
    t.index ["budget_id"], name: "index_transactions_on_budget_id"
    t.index ["household_id"], name: "index_transactions_on_household_id"
    t.index ["transaction_date"], name: "index_transactions_on_transaction_date"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.boolean "admin", default: false
    t.datetime "confirmation_sent_at", precision: nil
    t.string "confirmation_token"
    t.datetime "confirmed_at", precision: nil
    t.datetime "created_at", precision: nil
    t.datetime "current_sign_in_at", precision: nil
    t.string "current_sign_in_ip"
    t.string "email"
    t.string "encrypted_password", default: "", null: false
    t.string "first_name"
    t.bigint "household_id"
    t.string "image"
    t.string "last_name"
    t.datetime "last_sign_in_at", precision: nil
    t.string "last_sign_in_ip"
    t.string "nickname"
    t.string "provider", null: false
    t.datetime "remember_created_at", precision: nil
    t.datetime "reset_password_sent_at", precision: nil
    t.string "reset_password_token"
    t.integer "sign_in_count", default: 0, null: false
    t.text "tokens"
    t.string "uid", default: "", null: false
    t.string "unconfirmed_email"
    t.datetime "updated_at", precision: nil
    t.index ["email"], name: "index_users_on_email"
    t.index ["household_id"], name: "index_users_on_household_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
  end

  add_foreign_key "allocation_categories", "households", on_update: :cascade
  add_foreign_key "allocations", "households", on_update: :cascade
  add_foreign_key "allocations", "special_events"
  add_foreign_key "bank_accounts", "bank_accounts", column: "asset_bank_account_id"
  add_foreign_key "bank_accounts", "households", on_update: :cascade
  add_foreign_key "budgets", "households", on_update: :cascade
  add_foreign_key "bug_reports", "households", on_update: :cascade
  add_foreign_key "bug_reports", "users", column: "reporter_id"
  add_foreign_key "chat_settings", "households", on_update: :cascade
  add_foreign_key "chat_settings", "llm_models"
  add_foreign_key "conversation_turn_steps", "households", on_update: :cascade
  add_foreign_key "conversation_turns", "households", on_update: :cascade
  add_foreign_key "incomes", "households", on_update: :cascade
  add_foreign_key "institutions", "households", on_update: :cascade
  add_foreign_key "llm_models", "households", on_update: :cascade
  add_foreign_key "llm_usage_records", "households", on_update: :cascade
  add_foreign_key "llm_usage_records", "llm_models"
  add_foreign_key "sessions", "users"
  add_foreign_key "settings", "households", on_update: :cascade
  add_foreign_key "sink_fund_allocations", "households", on_update: :cascade
  add_foreign_key "special_events", "households"
  add_foreign_key "transactions", "households", on_update: :cascade
  add_foreign_key "users", "households", on_update: :cascade
end
