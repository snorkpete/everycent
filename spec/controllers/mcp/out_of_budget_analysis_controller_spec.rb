require 'rails_helper'

RSpec.describe Mcp::OutOfBudgetAnalysisController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
    auth_request(@user)

    # Ensure OOB categories exist so results guard doesn't raise
    create(:allocation_category, budget_role: 'spending', name: 'Out-of-Budget/ Sink Fund Transfers')
  end

  describe 'GET #show — validation errors' do
    it 'returns 400 when start_month is missing' do
      get :show, params: { end_month: '2024-03' }
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns 400 when end_month is missing' do
      get :show, params: { start_month: '2024-01' }
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns 400 with a descriptive error when start_month format is invalid' do
      get :show, params: { start_month: 'bad', end_month: '2024-03' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to include('start_month must be in YYYY-MM format')
    end

    it 'returns 400 with a descriptive error when end_month format is invalid' do
      get :show, params: { start_month: '2024-01', end_month: 'bad' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to include('end_month must be in YYYY-MM format')
    end

    it 'returns 400 when end_month is before start_month' do
      get :show, params: { start_month: '2024-06', end_month: '2024-01' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to include('end_month (2024-01) must not be before start_month (2024-06)')
    end

    it 'returns 400 with a descriptive error when group_by is invalid' do
      get :show, params: { start_month: '2024-01', end_month: '2024-03', group_by: 'category' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to include('group_by must be one of')
    end
  end

  describe 'GET #show — happy path' do
    let(:start_month) { '2024-01' }
    let(:end_month)   { '2024-03' }

    it 'returns 200' do
      get :show, params: { start_month: start_month, end_month: end_month }
      expect(response).to have_http_status(:ok)
    end

    it 'returns the start_month in the envelope' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['start_month']).to eq(start_month)
    end

    it 'returns the end_month in the envelope' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['end_month']).to eq(end_month)
    end

    it 'returns the correct amount_unit string' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['amount_unit']).to eq('*_cents = exact integer cents; *_display = ready-to-show currency string')
    end

    it 'returns a results array' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['results']).to be_an(Array)
    end

    it 'returns the group_by in the envelope' do
      get :show, params: { start_month: start_month, end_month: end_month, group_by: 'allocation_name' }
      json = JSON.parse(response.body)
      expect(json['group_by']).to eq('allocation_name')
    end

    it 'defaults group_by to month when not supplied' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['group_by']).to eq('month')
    end
  end
end
