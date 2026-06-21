class CreateConversationTurnSteps < ActiveRecord::Migration[7.1]
  def change
    create_table :conversation_turn_steps do |t|
      t.references :household, null: false, foreign_key: { on_update: :cascade }

      t.uuid :conversation_turn_id, null: false
      t.integer :step_index, null: false  # 0-based, assigned from steps[] array position

      t.text :thinking  # nullable — not all steps have thinking output
      t.jsonb :tool_calls, null: false, default: []  # [{name, params, result}]

      t.timestamps
    end

    add_index :conversation_turn_steps, :conversation_turn_id
    add_index :conversation_turn_steps, [:conversation_turn_id, :step_index], unique: true,
              name: 'index_conversation_turn_steps_on_turn_id_and_step_index'
    add_index :conversation_turn_steps, [:household_id, :created_at]
  end
end
