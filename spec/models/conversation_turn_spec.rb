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
require 'rails_helper'

RSpec.describe ConversationTurn, type: :model do
  let(:household) { create(:household) }

  around do |example|
    ActsAsTenant.with_tenant(household) { example.run }
  end

  describe 'factory' do
    it 'produces a valid record' do
      expect(build(:conversation_turn)).to be_valid
    end
  end

  describe 'validations' do
    it 'requires conversation_turn_id' do
      turn = build(:conversation_turn, conversation_turn_id: nil)
      expect(turn).not_to be_valid
      expect(turn.errors[:conversation_turn_id]).to be_present
    end

    it 'requires conversation_id' do
      turn = build(:conversation_turn, conversation_id: nil)
      expect(turn).not_to be_valid
      expect(turn.errors[:conversation_id]).to be_present
    end

    it 'requires user_prompt' do
      turn = build(:conversation_turn, user_prompt: nil)
      expect(turn).not_to be_valid
      expect(turn.errors[:user_prompt]).to be_present
    end

    it 'allows final_output to be nil' do
      turn = build(:conversation_turn, final_output: nil)
      expect(turn).to be_valid
    end
  end

  describe 'tenant isolation' do
    it 'scopes records to the current household' do
      turn = create(:conversation_turn)
      expect(turn.household_id).to eq household.id
    end

    it 'does not expose another household\'s turns' do
      other_household = create(:household)
      ActsAsTenant.with_tenant(other_household) { create(:conversation_turn) }

      expect(ConversationTurn.count).to eq 0
    end
  end
end
