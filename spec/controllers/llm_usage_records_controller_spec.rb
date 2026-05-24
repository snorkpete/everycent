require 'rails_helper'

RSpec.describe LlmUsageRecordsController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @llm_model = create(:llm_model, household: @household)
  end

  describe 'authentication' do
    context 'when not logged in' do
      it 'returns unauthorized for index' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns unauthorized for summary' do
        get :summary
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe '#index' do
    before :each do
      @user = create(:user, household: @household)
      auth_request(@user)
    end

    it 'returns a successful response' do
      get :index
      expect(response).to be_successful
    end

    it 'returns records ordered by created_at DESC' do
      old_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
      new_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
      old_record.update_columns(created_at: 2.days.ago)

      get :index

      json = JSON.parse(response.body)
      ids = json['records'].map { |r| r['id'] }
      expect(ids.first).to eq new_record.id
      expect(ids.last).to eq old_record.id
    end

    it 'returns total_count' do
      create_list(:llm_usage_record, 3, household: @household, llm_model: @llm_model)

      get :index

      json = JSON.parse(response.body)
      expect(json['total_count']).to eq 3
    end

    context 'pagination' do
      before :each do
        create_list(:llm_usage_record, 5, household: @household, llm_model: @llm_model)
      end

      it 'defaults to page 1 with 50 per page' do
        get :index
        json = JSON.parse(response.body)
        expect(json['records'].size).to eq 5
        expect(json['total_count']).to eq 5
      end

      it 'paginates results with per_page' do
        get :index, params: { per_page: 2 }
        json = JSON.parse(response.body)
        expect(json['records'].size).to eq 2
        expect(json['total_count']).to eq 5
      end

      it 'returns the second page' do
        get :index, params: { per_page: 3, page: 2 }
        json = JSON.parse(response.body)
        expect(json['records'].size).to eq 2
      end

      it 'caps per_page at 200' do
        get :index, params: { per_page: 999 }
        json = JSON.parse(response.body)
        expect(json['records'].size).to eq 5
      end
    end

    context 'date filters' do
      before :each do
        @old = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        @recent = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        @old.update_columns(created_at: Date.new(2026, 3, 1).beginning_of_day)
        @recent.update_columns(created_at: Date.new(2026, 5, 1).beginning_of_day)
      end

      it 'filters by start_date' do
        get :index, params: { start_date: '2026-04-01' }
        json = JSON.parse(response.body)
        expect(json['total_count']).to eq 1
        expect(json['records'].first['id']).to eq @recent.id
      end

      it 'filters by end_date' do
        get :index, params: { end_date: '2026-04-30' }
        json = JSON.parse(response.body)
        expect(json['total_count']).to eq 1
        expect(json['records'].first['id']).to eq @old.id
      end

      it 'filters by both start_date and end_date' do
        get :index, params: { start_date: '2026-02-01', end_date: '2026-04-01' }
        json = JSON.parse(response.body)
        expect(json['total_count']).to eq 1
        expect(json['records'].first['id']).to eq @old.id
      end
    end

    context 'tenant isolation' do
      it 'does not return records from another household' do
        create(:llm_usage_record, household: @household, llm_model: @llm_model)

        other_household = create(:household)
        ActsAsTenant.with_tenant(other_household) do
          other_model = create(:llm_model, household: other_household)
          create(:llm_usage_record, household: other_household, llm_model: other_model)
        end

        get :index

        json = JSON.parse(response.body)
        expect(json['total_count']).to eq 1
      end
    end
  end

  describe '#summary' do
    before :each do
      @user = create(:user, household: @household)
      auth_request(@user)
    end

    it 'returns a successful response' do
      get :summary
      expect(response).to be_successful
    end

    it 'returns zero totals when no records exist' do
      get :summary
      json = JSON.parse(response.body)
      expect(json['total_records']).to eq 0
      expect(json['total_tokens']).to eq 0
      expect(json['by_provider']).to eq []
      expect(json['by_category']).to eq []
    end

    it 'aggregates totals correctly' do
      create(:llm_usage_record,
        household: @household,
        llm_model: @llm_model,
        total_tokens: 1550,
        total_cost: '0.885'
      )
      create(:llm_usage_record,
        household: @household,
        llm_model: @llm_model,
        total_tokens: 2000,
        total_cost: '1.200'
      )

      get :summary

      json = JSON.parse(response.body)
      expect(json['total_records']).to eq 2
      expect(json['total_tokens']).to eq 3550
      expect(json['total_cost'].to_f).to be_within(0.0001).of(2.085)
    end

    it 'groups by provider' do
      create(:llm_usage_record,
        household: @household,
        llm_model: @llm_model,
        provider: 'anthropic',
        total_tokens: 1000,
        total_cost: '0.5'
      )

      local_model = create(:llm_model,
        household: @household,
        provider: 'ollama',
        name: 'qwen3:14b',
        input_token_cost: 0,
        output_token_cost: 0,
        cache_read_token_cost: 0,
        cache_write_token_cost: 0,
        thinking_token_cost: 0
      )
      create(:llm_usage_record,
        household: @household,
        llm_model: local_model,
        provider: 'ollama',
        llm_model_name: 'qwen3:14b',
        total_tokens: 5000,
        total_cost: '0.0'
      )

      get :summary

      json = JSON.parse(response.body)
      anthropic = json['by_provider'].find { |p| p['provider'] == 'anthropic' }
      ollama = json['by_provider'].find { |p| p['provider'] == 'ollama' }

      expect(anthropic['total_tokens']).to eq 1000
      expect(ollama['total_tokens']).to eq 5000
      expect(ollama['total_cost'].to_f).to eq 0.0
    end

    it 'groups by usage_category' do
      create(:llm_usage_record,
        household: @household,
        llm_model: @llm_model,
        usage_category: 'chat',
        total_tokens: 1000,
        total_cost: '0.5'
      )
      create(:llm_usage_record,
        household: @household,
        llm_model: @llm_model,
        usage_category: 'query_embedding',
        total_tokens: 500,
        total_cost: '0.05'
      )

      get :summary

      json = JSON.parse(response.body)
      chat = json['by_category'].find { |c| c['usage_category'] == 'chat' }
      embedding = json['by_category'].find { |c| c['usage_category'] == 'query_embedding' }

      expect(chat['total_tokens']).to eq 1000
      expect(embedding['total_tokens']).to eq 500
    end

    context 'date filters' do
      before :each do
        @old = create(:llm_usage_record,
          household: @household,
          llm_model: @llm_model,
          total_tokens: 1000,
          total_cost: '0.3'
        )
        @recent = create(:llm_usage_record,
          household: @household,
          llm_model: @llm_model,
          total_tokens: 2000,
          total_cost: '0.6'
        )
        @old.update_columns(created_at: Date.new(2026, 3, 1).beginning_of_day)
        @recent.update_columns(created_at: Date.new(2026, 5, 1).beginning_of_day)
      end

      it 'filters summary by start_date' do
        get :summary, params: { start_date: '2026-04-01' }
        json = JSON.parse(response.body)
        expect(json['total_records']).to eq 1
        expect(json['total_tokens']).to eq 2000
      end

      it 'filters summary by end_date' do
        get :summary, params: { end_date: '2026-04-30' }
        json = JSON.parse(response.body)
        expect(json['total_records']).to eq 1
        expect(json['total_tokens']).to eq 1000
      end
    end

    context 'tenant isolation' do
      it 'does not include records from another household in summary' do
        create(:llm_usage_record,
          household: @household,
          llm_model: @llm_model,
          total_tokens: 1000
        )

        other_household = create(:household)
        ActsAsTenant.with_tenant(other_household) do
          other_model = create(:llm_model, household: other_household)
          create(:llm_usage_record,
            household: other_household,
            llm_model: other_model,
            total_tokens: 99999
          )
        end

        get :summary

        json = JSON.parse(response.body)
        expect(json['total_records']).to eq 1
        expect(json['total_tokens']).to eq 1000
      end
    end
  end
end
