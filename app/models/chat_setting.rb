class ChatSetting < ApplicationRecord
  acts_as_tenant :household

  belongs_to :llm_model, optional: true

  before_save :strip_string_fields

  def self.as_hash
    record = get_setting_record
    {
      chat_enabled: record.chat_enabled,
      ollama_url: record.ollama_url,
      ollama_model: record.ollama_model,
      llm_model_id: record.llm_model_id,
      max_tool_iterations: record.max_tool_iterations,
      extras: record.extras,
    }
  end

  UPDATABLE_KEYS = %i[chat_enabled ollama_url ollama_model max_tool_iterations].freeze

  def self.update_settings(params)
    record = get_setting_record
    attrs = params.slice(*UPDATABLE_KEYS).to_h.compact
    attrs[:extras] = parse_extras(params[:extras]) if params.key?(:extras)
    attrs[:llm_model_id] = params[:llm_model_id] if params.key?(:llm_model_id)
    record.update(attrs)
    record
  end

  private_class_method def self.get_setting_record
    ChatSetting.first || ChatSetting.create!
  end

  private_class_method def self.parse_extras(value)
    case value
    when Hash then value
    when String then value.blank? ? {} : JSON.parse(value)
    else {}
    end
  rescue JSON::ParserError
    {}
  end

  private

  def strip_string_fields
    self.ollama_url = ollama_url.strip if ollama_url.is_a?(String)
    self.ollama_model = ollama_model.strip if ollama_model.is_a?(String)
  end
end
