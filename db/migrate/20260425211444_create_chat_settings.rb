class CreateChatSettings < ActiveRecord::Migration[7.1]
  def change
    create_table :chat_settings do |t|
      t.references :household, null: false, foreign_key: { on_update: :cascade }
      t.boolean :chat_enabled, null: false, default: false
      t.string :ollama_url
      t.string :ollama_model
      t.integer :max_tool_iterations, null: false, default: 5
      t.jsonb :extras, null: false, default: {}
      t.timestamps
    end
  end
end
