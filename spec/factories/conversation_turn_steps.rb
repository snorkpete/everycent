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
