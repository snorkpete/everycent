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
