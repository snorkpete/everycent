require 'rails_helper'

RSpec.describe Mcp::ConversationTurnsController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @llm_model = create(:llm_model,
      household: @household,
      provider: 'anthropic',
      name: 'claude-sonnet-4-5',
      input_token_cost: 300.0,
      output_token_cost: 1500.0,
      cache_read_token_cost: 30.0,
      cache_write_token_cost: 375.0,
      thinking_token_cost: 1500.0
    )
  end

  let(:valid_step) do
    {
      thinking: 'Let me look that up...',
      tool_calls: [{ name: 'analyze_overspending', params: {}, result: { total: 34200 } }],
      usage: {
        usage_category: 'chat',
        input_tokens: 1200,
        output_tokens: 350,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        thinking_tokens: 0,
        request_duration_ms: 4200,
        incomplete: false,
        tool_call_count: 1,
        tool_calls_detail: [{ name: 'analyze_overspending', duration_ms: 145 }],
        extras: {}
      }
    }
  end

  let(:valid_turn_params) do
    {
      llm_model_id: @llm_model.id,
      conversation_id: SecureRandom.uuid,
      conversation_turn_id: SecureRandom.uuid,
      user_prompt: 'How much did I spend on groceries?',
      final_output: 'You spent $342 on groceries.',
      steps: [valid_step]
    }
  end

  describe 'POST #create' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        post :create, params: valid_turn_params
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'creates records in all three tables and returns 201' do
        expect {
          post :create, params: valid_turn_params
        }.to change(ConversationTurn, :count).by(1)
          .and change(ConversationTurnStep, :count).by(1)
          .and change(LlmUsageRecord, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['steps_created']).to eq 1
      end

      it 'creates a multi-step turn correctly' do
        second_step = valid_step.deep_merge(usage: { input_tokens: 500, tool_call_count: 0 })
        params = valid_turn_params.merge(steps: [valid_step, second_step])

        expect {
          post :create, params: params
        }.to change(ConversationTurn, :count).by(1)
          .and change(ConversationTurnStep, :count).by(2)
          .and change(LlmUsageRecord, :count).by(2)

        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['steps_created']).to eq 2
      end

      it 'returns 422 when steps is empty' do
        post :create, params: valid_turn_params.merge(steps: [])
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns 404 when the llm_model is not found' do
        post :create, params: valid_turn_params.merge(llm_model_id: 99999)
        expect(response).to have_http_status(:not_found)
      end

      it 'does not find llm_models from another household' do
        other_household = create(:household)
        other_model = ActsAsTenant.with_tenant(other_household) do
          create(:llm_model, household: other_household, provider: 'openai', name: 'gpt-4')
        end

        post :create, params: valid_turn_params.merge(llm_model_id: other_model.id)
        expect(response).to have_http_status(:not_found)
      end

      it 'rolls back all tables and returns 422 on invalid step data' do
        invalid_step = valid_step.deep_merge(usage: { usage_category: 'invalid_category' })

        turns_before = ConversationTurn.count
        steps_before = ConversationTurnStep.count
        usage_before = LlmUsageRecord.count

        post :create, params: valid_turn_params.merge(steps: [invalid_step])

        expect(ConversationTurn.count).to eq turns_before
        expect(ConversationTurnStep.count).to eq steps_before
        expect(LlmUsageRecord.count).to eq usage_before

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_an(Array)
        expect(json['errors'].first).to include('Usage category')
      end

      it 'scopes the turn to the current household' do
        post :create, params: valid_turn_params
        expect(ConversationTurn.last.household_id).to eq @household.id
      end

      it 'scopes the step to the current household' do
        post :create, params: valid_turn_params
        expect(ConversationTurnStep.last.household_id).to eq @household.id
      end

      it 'scopes the usage record to the current household' do
        post :create, params: valid_turn_params
        expect(LlmUsageRecord.last.household_id).to eq @household.id
      end
    end
  end
end
