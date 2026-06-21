require 'rails_helper'

RSpec.describe ConversationTurnStep, type: :model do
  let(:household) { create(:household) }

  around do |example|
    ActsAsTenant.with_tenant(household) { example.run }
  end

  describe 'factory' do
    it 'produces a valid record' do
      expect(build(:conversation_turn_step)).to be_valid
    end
  end

  describe 'validations' do
    it 'requires conversation_turn_id' do
      step = build(:conversation_turn_step, conversation_turn_id: nil)
      expect(step).not_to be_valid
      expect(step.errors[:conversation_turn_id]).to be_present
    end

    it 'requires step_index' do
      step = build(:conversation_turn_step, step_index: nil)
      expect(step).not_to be_valid
      expect(step.errors[:step_index]).to be_present
    end

    it 'rejects negative step_index' do
      step = build(:conversation_turn_step, step_index: -1)
      expect(step).not_to be_valid
    end

    it 'allows zero step_index' do
      step = build(:conversation_turn_step, step_index: 0)
      expect(step).to be_valid
    end

    it 'allows thinking to be nil' do
      step = build(:conversation_turn_step, thinking: nil)
      expect(step).to be_valid
    end
  end

  describe 'tenant isolation' do
    it 'scopes records to the current household' do
      step = create(:conversation_turn_step)
      expect(step.household_id).to eq household.id
    end

    it 'does not expose another household\'s steps' do
      other_household = create(:household)
      ActsAsTenant.with_tenant(other_household) { create(:conversation_turn_step) }

      expect(ConversationTurnStep.count).to eq 0
    end
  end
end
