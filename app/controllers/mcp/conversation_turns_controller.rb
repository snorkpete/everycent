module Mcp
  class ConversationTurnsController < AppController
    def create
      turn = ConversationTurnRecorder.record(turn_params, household: current_household)
      render json: { created: 1 }, status: :created
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'LLM model not found' }, status: :not_found
    rescue ConversationTurnRecorder::InvalidPayloadError => e
      render json: { errors: [e.message] }, status: :unprocessable_entity
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: [e.message] }, status: :unprocessable_entity
    end

    private

    def turn_params
      params.permit(
        :llm_model_id,
        :conversation_id,
        :conversation_turn_id,
        :user_prompt,
        :final_output,
        steps: [
          :thinking,
          tool_calls: [:name, params: {}, result: {}],
          usage: [
            :usage_category,
            :input_tokens,
            :output_tokens,
            :cache_read_tokens,
            :cache_write_tokens,
            :thinking_tokens,
            :request_duration_ms,
            :incomplete,
            :tool_call_count,
            tool_calls_detail: [:name, :duration_ms],
            extras: {}
          ]
        ]
      )
    end
  end
end
