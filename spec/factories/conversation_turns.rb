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
