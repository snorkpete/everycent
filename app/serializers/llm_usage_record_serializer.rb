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
class LlmUsageRecordSerializer < ActiveModel::Serializer
  type 'llm_usage_record'

  attributes :id, :llm_model_id,
             :usage_category, :conversation_id, :conversation_turn_id,
             :input_tokens, :output_tokens, :cache_read_tokens,
             :cache_write_tokens, :thinking_tokens, :total_tokens,
             :input_token_cost_rate, :output_token_cost_rate,
             :cache_read_token_cost_rate, :cache_write_token_cost_rate,
             :thinking_token_cost_rate, :total_cost,
             :provider, :llm_model_name,
             :request_duration_ms, :incomplete, :tool_call_count,
             :tool_calls_detail, :extras,
             :created_at, :updated_at
end
