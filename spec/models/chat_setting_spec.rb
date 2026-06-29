# == Schema Information
#
# Table name: chat_settings
#
#  id                  :bigint           not null, primary key
#  chat_enabled        :boolean          default(FALSE), not null
#  extras              :jsonb            not null
#  max_tool_iterations :integer          default(5), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  household_id        :bigint           not null
#  llm_model_id        :bigint
#
# Indexes
#
#  index_chat_settings_on_household_id  (household_id)
#  index_chat_settings_on_llm_model_id  (llm_model_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#  fk_rails_...  (llm_model_id => llm_models.id)
#
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

    it 'includes llm_model as nil when no model is linked' do
      hash = ChatSetting.as_hash
      expect(hash[:llm_model]).to be_nil
    end

    it 'embeds the linked llm_model inline when a model is set' do
      model = create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5',
                                  url: 'https://api.anthropic.com', display_name: 'Claude Sonnet 4.5',
                                  active: true)
      ChatSetting.update_settings(llm_model_id: model.id)

      hash = ChatSetting.as_hash
      expect(hash[:llm_model]).to include(
        id: model.id,
        provider: 'anthropic',
        name: 'claude-sonnet-4-5',
        url: 'https://api.anthropic.com',
        display_name: 'Claude Sonnet 4.5',
        active: true,
      )
    end

    it 'does not include ollama_url or ollama_model keys' do
      hash = ChatSetting.as_hash
      expect(hash).not_to have_key(:ollama_url)
      expect(hash).not_to have_key(:ollama_model)
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
