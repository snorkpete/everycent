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
FactoryBot.define do
  factory :conversation_turn_step do
    household
    # conversation_turn_id is a UUID that matches an existing ConversationTurn.
    # Specs that need DB integrity can create a conversation_turn first and
    # pass its conversation_turn_id explicitly. For model-level unit tests
    # we just use a random uuid since the DB FK is on conversation_turn_id.
    conversation_turn_id { SecureRandom.uuid }
    step_index { 0 }
    thinking { nil }
    tool_calls { [] }
  end
end
