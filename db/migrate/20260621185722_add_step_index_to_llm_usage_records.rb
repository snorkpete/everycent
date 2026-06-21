class AddStepIndexToLlmUsageRecords < ActiveRecord::Migration[7.1]
  def up
    # Step 1: add column nullable so existing rows don't violate NOT NULL
    add_column :llm_usage_records, :step_index, :integer

    # Step 2: backfill existing rows with row_number()-1 partitioned by
    # conversation_turn_id ordered by id. This gives each step within a turn
    # a unique 0-based index consistent with insertion order.
    execute <<~SQL
      UPDATE llm_usage_records
      SET step_index = ranked.rn - 1
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY conversation_turn_id
                 ORDER BY id
               ) AS rn
        FROM llm_usage_records
      ) ranked
      WHERE llm_usage_records.id = ranked.id
    SQL

    # Step 3: set NOT NULL constraint and default 0 for future inserts
    change_column_null :llm_usage_records, :step_index, false, 0
    change_column_default :llm_usage_records, :step_index, 0

    # Step 4: add unique index AFTER backfill to avoid collisions on existing rows
    add_index :llm_usage_records, [:conversation_turn_id, :step_index], unique: true,
              name: 'index_llm_usage_records_on_turn_id_and_step_index'
  end

  def down
    remove_index :llm_usage_records, name: 'index_llm_usage_records_on_turn_id_and_step_index'
    remove_column :llm_usage_records, :step_index
  end
end
