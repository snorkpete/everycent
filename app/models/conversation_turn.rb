class ConversationTurn < ApplicationRecord
  # One row per user turn (user message + eventual answer).
  # The `incomplete` field is derived by ConversationTurnRecorder from the
  # steps' usage incomplete flags — it is never set directly from the payload.

  acts_as_tenant :household

  has_many :conversation_turn_steps, primary_key: :conversation_turn_id,
                                     foreign_key: :conversation_turn_id,
                                     dependent: :destroy

  validates :conversation_turn_id, presence: true
  validates :conversation_id, presence: true
  validates :user_prompt, presence: true
  validates :incomplete, inclusion: { in: [true, false] }
end
