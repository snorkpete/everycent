# == Schema Information
#
# Table name: conversation_turn_steps
#
#  id                   :bigint           not null, primary key
#  step_index           :integer          not null
#  thinking             :text
#  tool_calls           :jsonb            not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  conversation_turn_id :uuid             not null
#  household_id         :bigint           not null
#
# Indexes
#
#  index_conversation_turn_steps_on_conversation_turn_id         (conversation_turn_id)
#  index_conversation_turn_steps_on_household_id                 (household_id)
#  index_conversation_turn_steps_on_household_id_and_created_at  (household_id,created_at)
#  index_conversation_turn_steps_on_turn_id_and_step_index       (conversation_turn_id,step_index) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#
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
