class ConversationTurnStep < ApplicationRecord
  # One row per inner LLM call within a turn.
  # step_index is 0-based, assigned from the steps[] array position in the payload.
  # tool_calls stores [{name, params, result}] — results ARE captured.

  acts_as_tenant :household

  belongs_to :conversation_turn, primary_key: :conversation_turn_id,
                                  foreign_key: :conversation_turn_id,
                                  optional: true

  validates :conversation_turn_id, presence: true
  validates :step_index, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
