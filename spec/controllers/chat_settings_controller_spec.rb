require 'rails_helper'

describe ChatSettingsController do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe '#index' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'returns a successful response' do
        get :index
        expect(response).to be_successful
      end

      it 'returns default chat settings when none exist' do
        get :index

        json = JSON.parse(response.body)
        expect(json).to include(
          'chat_enabled' => false,
          'max_tool_iterations' => 5,
          'extras' => {},
        )
        expect(json['ollama_url']).to be_nil
        expect(json['ollama_model']).to be_nil
        expect(json['llm_model_id']).to be_nil
      end
    end
  end

  describe '#create' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        post :create, params: { chat_enabled: true }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'returns a successful response' do
        post :create, params: { chat_enabled: true, ollama_url: 'http://localhost:11434' }
        expect(response).to be_successful
      end

      it 'persists and returns updated chat settings' do
        post :create, params: {
          chat_enabled: true,
          ollama_url: 'http://192.168.68.59:11434',
          ollama_model: 'qwen3:14b',
          max_tool_iterations: 10,
        }

        json = JSON.parse(response.body)
        expect(json).to include(
          'chat_enabled' => true,
          'ollama_url' => 'http://192.168.68.59:11434',
          'ollama_model' => 'qwen3:14b',
          'max_tool_iterations' => 10,
        )
      end

      it 'parses extras from a JSON string' do
        post :create, params: {
          chat_enabled: false,
          extras: '{"temperature": 0.7}',
        }

        json = JSON.parse(response.body)
        expect(json['extras']).to eq('temperature' => 0.7)
      end

      it 'defaults extras to empty hash on invalid JSON' do
        post :create, params: {
          chat_enabled: false,
          extras: 'not valid json',
        }

        json = JSON.parse(response.body)
        expect(json['extras']).to eq({})
      end

      it 'persists and returns llm_model_id' do
        llm_model = create(:llm_model)

        post :create, params: { llm_model_id: llm_model.id }

        json = JSON.parse(response.body)
        expect(json['llm_model_id']).to eq(llm_model.id)
      end

      it 'clears llm_model_id when set to nil' do
        llm_model = create(:llm_model)
        ChatSetting.update_settings(llm_model_id: llm_model.id)

        post :create, params: { llm_model_id: nil }

        json = JSON.parse(response.body)
        expect(json['llm_model_id']).to be_nil
      end
    end
  end
end
