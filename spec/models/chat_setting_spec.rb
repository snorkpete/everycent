require 'rails_helper'

RSpec.describe ChatSetting, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe 'associations' do
    it 'belongs to llm_model optionally' do
      setting = ChatSetting.create!
      expect(setting).to be_valid
      expect(setting.llm_model).to be_nil
    end

    it 'can be associated with an llm_model' do
      model = create(:llm_model)
      setting = ChatSetting.create!(llm_model: model)
      expect(setting.llm_model).to eq(model)
      expect(setting.llm_model_id).to eq(model.id)
    end
  end

  describe '.as_hash' do
    it 'includes llm_model_id as nil when not set' do
      hash = ChatSetting.as_hash
      expect(hash).to include(llm_model_id: nil)
    end

    it 'includes llm_model_id when set' do
      model = create(:llm_model)
      ChatSetting.update_settings(llm_model_id: model.id)

      hash = ChatSetting.as_hash
      expect(hash).to include(llm_model_id: model.id)
    end
  end

  describe '.update_settings' do
    it 'persists llm_model_id' do
      model = create(:llm_model)
      ChatSetting.update_settings(llm_model_id: model.id)

      record = ChatSetting.first
      expect(record.llm_model_id).to eq(model.id)
    end

    it 'clears llm_model_id when set to nil' do
      model = create(:llm_model)
      ChatSetting.update_settings(llm_model_id: model.id)
      ChatSetting.update_settings(llm_model_id: nil)

      record = ChatSetting.first
      expect(record.llm_model_id).to be_nil
    end
  end
end
