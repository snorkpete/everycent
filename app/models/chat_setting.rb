# == Schema Information
#
# Table name: chat_settings
#
#  id                  :bigint           not null, primary key
#  chat_enabled        :boolean          default(FALSE), not null
#  extras              :jsonb            not null
#  max_tool_iterations :integer          default(5), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  household_id        :bigint           not null
#  llm_model_id        :bigint
#
# Indexes
#
#  index_chat_settings_on_household_id  (household_id)
#  index_chat_settings_on_llm_model_id  (llm_model_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#  fk_rails_...  (llm_model_id => llm_models.id)
#
class ChatSetting < ApplicationRecord
  acts_as_tenant :household

  belongs_to :llm_model, optional: true

  def self.as_hash
    record = get_setting_record
    {
      chat_enabled: record.chat_enabled,
      llm_model_id: record.llm_model_id,
      max_tool_iterations: record.max_tool_iterations,
      extras: record.extras,
      llm_model: record.llm_model && llm_model_hash(record.llm_model),
    }
  end

  UPDATABLE_KEYS = %i[chat_enabled max_tool_iterations].freeze

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

  private_class_method def self.llm_model_hash(model)
    {
      id: model.id,
      provider: model.provider,
      name: model.name,
      display_name: model.display_name,
      url: model.url,
      input_token_cost: model.input_token_cost,
      output_token_cost: model.output_token_cost,
      cache_read_token_cost: model.cache_read_token_cost,
      cache_write_token_cost: model.cache_write_token_cost,
      thinking_token_cost: model.thinking_token_cost,
      active: model.active,
    }
  end
end
