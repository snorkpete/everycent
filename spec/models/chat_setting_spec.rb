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

  describe 'whitespace handling' do
    it 'strips leading and trailing whitespace from ollama_url on save' do
      setting = ChatSetting.create!(ollama_url: '  http://example.com:11434  ')
      expect(setting.ollama_url).to eq('http://example.com:11434')
    end

    it 'strips leading and trailing whitespace from ollama_model on save' do
      setting = ChatSetting.create!(ollama_model: " qwen3:14b\n")
      expect(setting.ollama_model).to eq('qwen3:14b')
    end

    it 'leaves nil string fields alone' do
      setting = ChatSetting.create!(ollama_url: nil, ollama_model: nil)
      expect(setting.ollama_url).to be_nil
      expect(setting.ollama_model).to be_nil
    end
  end
end
