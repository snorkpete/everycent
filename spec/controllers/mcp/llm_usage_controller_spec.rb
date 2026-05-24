require 'rails_helper'

RSpec.describe Mcp::LlmUsageController, type: :controller do
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

  let(:valid_record_attrs) do
    {
      usage_category: 'chat',
      conversation_id: SecureRandom.uuid,
      conversation_turn_id: SecureRandom.uuid,
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
  end

  describe 'POST #create' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        post :create, params: { llm_model_id: @llm_model.id, records: [valid_record_attrs] }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'creates a usage record and returns 201' do
        expect {
          post :create, params: { llm_model_id: @llm_model.id, records: [valid_record_attrs] }
        }.to change(LlmUsageRecord, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['created']).to eq 1
      end

      it 'creates multiple records in a batch' do
        second_record = valid_record_attrs.merge(conversation_turn_id: SecureRandom.uuid)

        expect {
          post :create, params: {
            llm_model_id: @llm_model.id,
            records: [valid_record_attrs, second_record]
          }
        }.to change(LlmUsageRecord, :count).by(2)

        json = JSON.parse(response.body)
        expect(json['created']).to eq 2
      end

      it 'rolls back the entire batch and returns 422 when any record fails validation' do
        invalid_record = valid_record_attrs.merge(usage_category: 'invalid_category')

        expect {
          post :create, params: {
            llm_model_id: @llm_model.id,
            records: [valid_record_attrs, invalid_record]
          }
        }.not_to change(LlmUsageRecord, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_an(Array)
        expect(json['errors'].first).to be_a(String)
        expect(json['errors'].first).to include('Usage category')
      end

      it 'returns 404 when the llm_model is not found' do
        post :create, params: { llm_model_id: 99999, records: [valid_record_attrs] }
        expect(response).to have_http_status(:not_found)
      end

      it 'does not find llm_models from another household' do
        other_household = create(:household)
        other_model = ActsAsTenant.with_tenant(other_household) do
          create(:llm_model, household: other_household, provider: 'openai', name: 'gpt-4')
        end

        post :create, params: { llm_model_id: other_model.id, records: [valid_record_attrs] }
        expect(response).to have_http_status(:not_found)
      end

      it 'scopes created records to the current household' do
        post :create, params: { llm_model_id: @llm_model.id, records: [valid_record_attrs] }

        record = LlmUsageRecord.last
        expect(record.household_id).to eq @household.id
      end
    end
  end
end
