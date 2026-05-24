class CreateLlmUsageRecords < ActiveRecord::Migration[7.1]
  def change
    create_table :llm_usage_records do |t|
      t.references :household, null: false, foreign_key: { on_update: :cascade }
      t.references :llm_model, null: false, foreign_key: true

      t.string :usage_category, null: false  # 'chat', 'query_embedding', 'background_embedding'
      t.uuid :conversation_id, null: false
      t.uuid :conversation_turn_id, null: false

      # Token counts — all default 0 so math works without null handling
      t.integer :input_tokens, null: false, default: 0
      t.integer :output_tokens, null: false, default: 0
      t.integer :cache_read_tokens, null: false, default: 0
      t.integer :cache_write_tokens, null: false, default: 0
      t.integer :thinking_tokens, null: false, default: 0
      t.integer :total_tokens, null: false, default: 0

      # Cost rates copied from llm_models at write time (point-in-time snapshot)
      # All in cents per million tokens (matches llm_models convention)
      t.decimal :input_token_cost_rate, precision: 10, scale: 4, null: false, default: 0
      t.decimal :output_token_cost_rate, precision: 10, scale: 4, null: false, default: 0
      t.decimal :cache_read_token_cost_rate, precision: 10, scale: 4, null: false, default: 0
      t.decimal :cache_write_token_cost_rate, precision: 10, scale: 4, null: false, default: 0
      t.decimal :thinking_token_cost_rate, precision: 10, scale: 4, null: false, default: 0

      # Computed at write time. Decimal cents (sub-cent precision).
      # Formula: total_cost = (input_tokens * input_token_cost_rate + ...) / 1_000_000
      t.decimal :total_cost, precision: 12, scale: 4, null: false, default: 0

      # Denormalized from llm_models for fast querying without join
      t.string :provider, null: false
      t.string :llm_model_name, null: false

      t.integer :request_duration_ms, null: false, default: 0
      t.boolean :incomplete, null: false, default: false
      t.integer :tool_call_count, null: false, default: 0
      t.jsonb :tool_calls_detail, null: false, default: []
      t.jsonb :extras, null: false, default: {}

      t.timestamps
    end

    add_index :llm_usage_records, :conversation_id
    add_index :llm_usage_records, :conversation_turn_id
    add_index :llm_usage_records, [:household_id, :created_at]
  end
end
