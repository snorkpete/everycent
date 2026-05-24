require 'rails_helper'

RSpec.describe LlmModel, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  it 'is valid with required attributes' do
    model = build(:llm_model)
    expect(model).to be_valid
  end

  it 'is invalid without a provider' do
    model = build(:llm_model, provider: nil)
    expect(model).not_to be_valid
    expect(model.errors[:provider]).to be_present
  end

  it 'is invalid without a name' do
    model = build(:llm_model, name: nil)
    expect(model).not_to be_valid
    expect(model.errors[:name]).to be_present
  end

  it 'is invalid without a url' do
    model = build(:llm_model, url: nil)
    expect(model).not_to be_valid
    expect(model.errors[:url]).to be_present
  end

  it 'is invalid with a blank url' do
    model = build(:llm_model, url: '   ')
    expect(model).not_to be_valid
    expect(model.errors[:url]).to be_present
  end

  it 'is invalid when name is not unique within the same household and provider' do
    create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5')
    duplicate = build(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5')
    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:name]).to be_present
  end

  it 'allows the same name for a different provider' do
    create(:llm_model, provider: 'anthropic', name: 'sonnet')
    different_provider = build(:llm_model, provider: 'openai', name: 'sonnet')
    expect(different_provider).to be_valid
  end

  it 'allows the same name and provider for a different household' do
    create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5')

    second_household = create(:household)
    ActsAsTenant.current_tenant = second_household

    model_in_other_household = build(:llm_model, household: second_household, provider: 'anthropic', name: 'claude-sonnet-4-5')
    expect(model_in_other_household).to be_valid
  end

  it 'defaults active to true' do
    model = LlmModel.create!(provider: 'anthropic', name: 'claude-sonnet-4-5', url: 'https://api.anthropic.com')
    expect(model.reload.active).to eq true
  end

  it 'defaults cost columns to 0' do
    model = LlmModel.create!(provider: 'anthropic', name: 'claude-sonnet-4-5', url: 'https://api.anthropic.com')
    model.reload
    expect(model.input_token_cost).to eq 0
    expect(model.output_token_cost).to eq 0
    expect(model.cache_read_token_cost).to eq 0
    expect(model.cache_write_token_cost).to eq 0
    expect(model.thinking_token_cost).to eq 0
  end

  it 'scopes records to the current household' do
    create(:llm_model)

    second_household = create(:household)
    ActsAsTenant.current_tenant = second_household
    create(:llm_model, household: second_household, name: 'other-model')

    ActsAsTenant.current_tenant = @household
    expect(LlmModel.count).to eq 1
  end

  describe '.sorted' do
    it 'returns records ordered by provider, then name' do
      create(:llm_model, provider: 'openai', name: 'gpt-4o')
      create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5')
      create(:llm_model, provider: 'anthropic', name: 'claude-haiku-4-5')

      sorted = LlmModel.sorted
      expect(sorted.map { |m| [m.provider, m.name] }).to eq([
        ['anthropic', 'claude-haiku-4-5'],
        ['anthropic', 'claude-sonnet-4-5'],
        ['openai', 'gpt-4o']
      ])
    end
  end

  describe 'whitespace handling' do
    it 'strips leading and trailing whitespace from url on save' do
      model = LlmModel.create!(provider: 'anthropic', name: 'claude-sonnet-4-5', url: '  http://localhost:11434  ')
      expect(model.url).to eq('http://localhost:11434')
    end

    it 'leaves non-string url alone' do
      model = build(:llm_model)
      model.url = nil
      # nil url should leave the nil in place (validation will fail, but strip won't raise)
      model.valid?
      expect(model.url).to be_nil
    end
  end
end
