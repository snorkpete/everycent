class MoveUrlToLlmModelsAndDropChatSettingsFields < ActiveRecord::Migration[7.1]
  def up
    # Add url column nullable to allow backfill
    add_column :llm_models, :url, :string

    # Backfill: copy ollama_url from chat_settings to the linked llm_model
    execute <<~SQL
      UPDATE llm_models
      SET url = chat_settings.ollama_url
      FROM chat_settings
      WHERE llm_models.id = chat_settings.llm_model_id
        AND chat_settings.ollama_url IS NOT NULL
    SQL

    # Any unlinked or unbackfilled rows get empty string (better than null for required field)
    execute "UPDATE llm_models SET url = '' WHERE url IS NULL"

    change_column_null :llm_models, :url, false

    # Drop the now-redundant chat_settings fields
    remove_column :chat_settings, :ollama_url, :string
    remove_column :chat_settings, :ollama_model, :string
  end

  def down
    add_column :chat_settings, :ollama_model, :string
    add_column :chat_settings, :ollama_url, :string

    execute <<~SQL
      UPDATE chat_settings
      SET ollama_url = llm_models.url,
          ollama_model = llm_models.name
      FROM llm_models
      WHERE chat_settings.llm_model_id = llm_models.id
    SQL

    remove_column :llm_models, :url
  end
end
