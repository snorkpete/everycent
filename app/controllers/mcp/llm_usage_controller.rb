module Mcp
  class LlmUsageController < AppController
    def create
      llm_model = LlmModel.find_by(id: params[:llm_model_id])
      return render json: { error: 'LLM model not found' }, status: :not_found unless llm_model

      records_params = params.require(:records)

      created_records = []
      error_messages = []

      ActiveRecord::Base.transaction do
        records_params.each_with_index do |record_attrs, index|
          input_tokens = record_attrs[:input_tokens].to_i
          output_tokens = record_attrs[:output_tokens].to_i
          cache_read_tokens = record_attrs[:cache_read_tokens].to_i
          cache_write_tokens = record_attrs[:cache_write_tokens].to_i
          thinking_tokens = record_attrs[:thinking_tokens].to_i

          total_tokens = input_tokens + output_tokens + cache_read_tokens +
                         cache_write_tokens + thinking_tokens

          total_cost = LlmUsageRecord.compute_total_cost(
            input_tokens: input_tokens,
            output_tokens: output_tokens,
            cache_read_tokens: cache_read_tokens,
            cache_write_tokens: cache_write_tokens,
            thinking_tokens: thinking_tokens,
            input_token_cost_rate: llm_model.input_token_cost,
            output_token_cost_rate: llm_model.output_token_cost,
            cache_read_token_cost_rate: llm_model.cache_read_token_cost,
            cache_write_token_cost_rate: llm_model.cache_write_token_cost,
            thinking_token_cost_rate: llm_model.thinking_token_cost
          )

          record = LlmUsageRecord.new(
            llm_model: llm_model,
            usage_category: record_attrs[:usage_category],
            conversation_id: record_attrs[:conversation_id],
            conversation_turn_id: record_attrs[:conversation_turn_id],
            input_tokens: input_tokens,
            output_tokens: output_tokens,
            cache_read_tokens: cache_read_tokens,
            cache_write_tokens: cache_write_tokens,
            thinking_tokens: thinking_tokens,
            total_tokens: total_tokens,
            input_token_cost_rate: llm_model.input_token_cost,
            output_token_cost_rate: llm_model.output_token_cost,
            cache_read_token_cost_rate: llm_model.cache_read_token_cost,
            cache_write_token_cost_rate: llm_model.cache_write_token_cost,
            thinking_token_cost_rate: llm_model.thinking_token_cost,
            total_cost: total_cost,
            provider: llm_model.provider,
            llm_model_name: llm_model.name,
            request_duration_ms: record_attrs[:request_duration_ms].to_i,
            incomplete: record_attrs[:incomplete] || false,
            tool_call_count: record_attrs[:tool_call_count].to_i,
            tool_calls_detail: record_attrs[:tool_calls_detail] || [],
            extras: record_attrs[:extras] || {}
          )

          if record.save
            created_records << record
          else
            error_messages << "Record #{index}: #{record.errors.full_messages.join(', ')}"
          end
        end

        raise ActiveRecord::Rollback if error_messages.any?
      end

      if error_messages.any?
        render json: { errors: error_messages }, status: :unprocessable_entity
      else
        render json: { created: created_records.size }, status: :created
      end
    end
  end
end
