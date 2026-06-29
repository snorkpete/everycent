# == Schema Information
#
# Table name: conversation_turns
#
#  id                   :bigint           not null, primary key
#  final_output         :text
#  incomplete           :boolean          default(FALSE), not null
#  user_prompt          :text             not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  conversation_id      :uuid             not null
#  conversation_turn_id :uuid             not null
#  household_id         :bigint           not null
#
# Indexes
#
#  index_conversation_turns_on_conversation_id              (conversation_id)
#  index_conversation_turns_on_conversation_turn_id         (conversation_turn_id) UNIQUE
#  index_conversation_turns_on_household_id                 (household_id)
#  index_conversation_turns_on_household_id_and_created_at  (household_id,created_at)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#
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
