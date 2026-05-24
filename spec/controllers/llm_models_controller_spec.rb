require 'rails_helper'

RSpec.describe LlmModelsController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe '#index' do
    before :each do
      create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5')
      create(:llm_model, provider: 'anthropic', name: 'claude-opus-4-5')
    end

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

      it 'returns all llm models for the household' do
        get :index
        expect(assigns(:llm_models).size).to eq 2
      end

      it 'does not return models from other households' do
        other_household = create(:household)
        ActsAsTenant.with_tenant(other_household) do
          create(:llm_model, household: other_household, provider: 'openai', name: 'gpt-4')
        end

        get :index
        expect(assigns(:llm_models).size).to eq 2
      end
    end
  end

  describe '#show' do
    before :each do
      @llm_model = create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5')
    end

    context 'when not logged in' do
      it 'returns unauthorized' do
        get :show, params: { id: @llm_model.id }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'returns a successful response' do
        get :show, params: { id: @llm_model.id }
        expect(response).to be_successful
      end

      it 'assigns the correct llm model' do
        get :show, params: { id: @llm_model.id }
        expect(assigns(:llm_model)).to eq @llm_model
      end
    end
  end

  describe '#create' do
    let(:valid_params) do
      {
        llm_model: {
          provider: 'anthropic',
          name: 'claude-haiku-4-5',
          display_name: 'Claude Haiku 4.5',
          url: 'https://api.anthropic.com',
          input_token_cost: 100.0000,
          output_token_cost: 500.0000,
          cache_read_token_cost: 10.0000,
          cache_write_token_cost: 125.0000,
          thinking_token_cost: 500.0000,
          active: true,
        }
      }
    end

    context 'when not logged in' do
      it 'returns unauthorized' do
        post :create, params: valid_params
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'creates a new llm model' do
        expect {
          post :create, params: valid_params
        }.to change(LlmModel, :count).by(1)
      end

      it 'returns a successful response' do
        post :create, params: valid_params
        expect(response).to be_successful
      end

      it 'returns 422 for invalid params' do
        post :create, params: { llm_model: { provider: nil, name: nil } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe '#update' do
    before :each do
      @llm_model = create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5', active: true)
    end

    context 'when not logged in' do
      it 'returns unauthorized' do
        put :update, params: { id: @llm_model.id, llm_model: { active: false } }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'updates the llm model' do
        put :update, params: { id: @llm_model.id, llm_model: { active: false, display_name: 'Updated Name' } }
        @llm_model.reload
        expect(@llm_model.active).to eq false
        expect(@llm_model.display_name).to eq 'Updated Name'
      end

      it 'returns a successful response' do
        put :update, params: { id: @llm_model.id, llm_model: { active: false } }
        expect(response).to be_successful
      end
    end
  end

  describe '#destroy' do
    before :each do
      @llm_model = create(:llm_model, provider: 'anthropic', name: 'claude-sonnet-4-5')
    end

    context 'when not logged in' do
      it 'returns unauthorized' do
        delete :destroy, params: { id: @llm_model.id }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'destroys the llm model' do
        expect {
          delete :destroy, params: { id: @llm_model.id }
        }.to change(LlmModel, :count).by(-1)
      end

      it 'returns a successful response' do
        delete :destroy, params: { id: @llm_model.id }
        expect(response).to be_successful
      end
    end
  end
end
