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
