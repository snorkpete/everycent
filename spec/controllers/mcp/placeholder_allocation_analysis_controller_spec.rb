require 'rails_helper'

RSpec.describe Mcp::PlaceholderAllocationAnalysisController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
    auth_request(@user)
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

    it 'returns results with monthly_summary and top_placeholders keys' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['results']).to be_a(Hash)
      expect(json['results'].keys).to match_array(%w[monthly_summary top_placeholders])
    end

    it 'monthly_summary is an array' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['results']['monthly_summary']).to be_an(Array)
    end

    it 'top_placeholders is an array' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['results']['top_placeholders']).to be_an(Array)
    end
  end
end
