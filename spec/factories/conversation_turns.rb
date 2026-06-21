FactoryBot.define do
  factory :conversation_turn do
    household
    conversation_turn_id { SecureRandom.uuid }
    conversation_id { SecureRandom.uuid }
    user_prompt { 'How much did I spend on groceries this month?' }
    final_output { 'You spent $342 on groceries this month.' }
    incomplete { false }
  end
end
