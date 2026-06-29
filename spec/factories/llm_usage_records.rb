# == Schema Information
#
# Table name: llm_usage_records
#
#  id                          :bigint           not null, primary key
#  cache_read_token_cost_rate  :decimal(10, 4)   default(0.0), not null
#  cache_read_tokens           :integer          default(0), not null
#  cache_write_token_cost_rate :decimal(10, 4)   default(0.0), not null
#  cache_write_tokens          :integer          default(0), not null
#  extras                      :jsonb            not null
#  incomplete                  :boolean          default(FALSE), not null
#  input_token_cost_rate       :decimal(10, 4)   default(0.0), not null
#  input_tokens                :integer          default(0), not null
#  llm_model_name              :string           not null
#  output_token_cost_rate      :decimal(10, 4)   default(0.0), not null
#  output_tokens               :integer          default(0), not null
#  provider                    :string           not null
#  request_duration_ms         :integer          default(0), not null
#  step_index                  :integer          default(0), not null
#  thinking_token_cost_rate    :decimal(10, 4)   default(0.0), not null
#  thinking_tokens             :integer          default(0), not null
#  tool_call_count             :integer          default(0), not null
#  tool_calls_detail           :jsonb            not null
#  total_cost                  :decimal(12, 4)   default(0.0), not null
#  total_tokens                :integer          default(0), not null
#  usage_category              :string           not null
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  conversation_id             :uuid             not null
#  conversation_turn_id        :uuid             not null
#  household_id                :bigint           not null
#  llm_model_id                :bigint           not null
#
# Indexes
#
#  index_llm_usage_records_on_conversation_id              (conversation_id)
#  index_llm_usage_records_on_conversation_turn_id         (conversation_turn_id)
#  index_llm_usage_records_on_household_id                 (household_id)
#  index_llm_usage_records_on_household_id_and_created_at  (household_id,created_at)
#  index_llm_usage_records_on_llm_model_id                 (llm_model_id)
#  index_llm_usage_records_on_turn_id_and_step_index       (conversation_turn_id,step_index) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#  fk_rails_...  (llm_model_id => llm_models.id)
#
FactoryBot.define do
  factory :llm_usage_record do
    household
    llm_model

    usage_category { 'chat' }
    conversation_id { SecureRandom.uuid }
    conversation_turn_id { SecureRandom.uuid }

    input_tokens { 1200 }
    output_tokens { 350 }
    cache_read_tokens { 0 }
    cache_write_tokens { 0 }
    thinking_tokens { 0 }
    total_tokens { 1550 }

    # Rates match the default llm_model factory (anthropic/claude-sonnet-4-5)
    input_token_cost_rate { 300.0000 }
    output_token_cost_rate { 1500.0000 }
    cache_read_token_cost_rate { 30.0000 }
    cache_write_token_cost_rate { 375.0000 }
    thinking_token_cost_rate { 1500.0000 }

    # (1200 * 300 + 350 * 1500) / 1_000_000 = (360_000 + 525_000) / 1_000_000 = 0.885
    total_cost { 0.8850 }

    provider { 'anthropic' }
    llm_model_name { 'claude-sonnet-4-5' }

    request_duration_ms { 4200 }
    incomplete { false }
    tool_call_count { 0 }
    tool_calls_detail { [] }
    extras { {} }
  end
end
