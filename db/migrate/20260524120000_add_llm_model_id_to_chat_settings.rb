class AddLlmModelIdToChatSettings < ActiveRecord::Migration[7.1]
  def change
    add_reference :chat_settings, :llm_model, null: true, foreign_key: true
  end
end
