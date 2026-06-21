class CreateConversationTurns < ActiveRecord::Migration[7.1]
  def change
    create_table :conversation_turns do |t|
      t.references :household, null: false, foreign_key: { on_update: :cascade }

      t.uuid :conversation_turn_id, null: false
      t.uuid :conversation_id, null: false

      t.text :user_prompt, null: false
      t.text :final_output  # nullable — absent on interrupted turns

      # Derived by the recorder from steps[].usage.incomplete flags
      t.boolean :incomplete, null: false, default: false

      t.timestamps
    end

    add_index :conversation_turns, :conversation_turn_id, unique: true
    add_index :conversation_turns, :conversation_id
    add_index :conversation_turns, [:household_id, :created_at]
  end
end
