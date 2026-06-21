class ConversationTurnRecorder
  # Model-layer service that persists a full conversation turn in a single transaction:
  #   - 1 conversation_turns row
  #   - N conversation_turn_steps rows (one per step)
  #   - N llm_usage_records rows (one per step, via LlmUsageRecord.create_batch!)
  #
  # `incomplete` is derived from the steps' usage incomplete flags — if any step
  # is incomplete, the turn is marked incomplete. It is NOT taken from the payload.
  #
  # `step_index` is the 0-based array position of each step in the payload;
  # it is applied identically to the step row and its usage row so the two tables
  # share the same (conversation_turn_id, step_index) key.

  # Raised when a required field is missing from the turn_dto.
  class InvalidPayloadError < ArgumentError; end

  def self.record(turn_dto, household:)
    new(turn_dto, household: household).record
  end

  def initialize(turn_dto, household:)
    # Accept both plain hashes and ActionController::Parameters
    @dto = turn_dto.respond_to?(:to_unsafe_h) ? turn_dto.to_unsafe_h.with_indifferent_access
                                               : turn_dto.with_indifferent_access
    @household = household
  end

  def record
    validate_payload!

    ActsAsTenant.with_tenant(@household) do
      llm_model = LlmModel.find_by(id: @dto[:llm_model_id])
      raise ActiveRecord::RecordNotFound, "LLM model not found" unless llm_model

      steps = Array(@dto[:steps])
      incomplete = steps.any? { |s| s.dig(:usage, :incomplete) }

      ApplicationRecord.transaction do
        turn = ConversationTurn.create!(
          conversation_turn_id: @dto[:conversation_turn_id],
          conversation_id: @dto[:conversation_id],
          user_prompt: @dto[:user_prompt],
          final_output: @dto[:final_output],
          incomplete: incomplete
        )

        steps.each_with_index do |step, idx|
          ConversationTurnStep.create!(
            conversation_turn_id: turn.conversation_turn_id,
            step_index: idx,
            thinking: step[:thinking],
            tool_calls: step[:tool_calls] || []
          )
        end

        usage_records = steps.each_with_index.map do |step, idx|
          usage = step[:usage] || {}
          usage.with_indifferent_access.merge(
            conversation_id: @dto[:conversation_id],
            conversation_turn_id: @dto[:conversation_turn_id],
            step_index: idx
          )
        end

        LlmUsageRecord.create_batch!(llm_model: llm_model, records: usage_records)

        turn
      end
    end
  end

  private

  def validate_payload!
    required = %i[llm_model_id conversation_id conversation_turn_id user_prompt steps]
    missing = required.reject { |k| @dto.key?(k) }
    raise InvalidPayloadError, "Missing required fields: #{missing.join(', ')}" if missing.any?
  end
end
