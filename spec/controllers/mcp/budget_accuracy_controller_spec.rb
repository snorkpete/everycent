require 'rails_helper'

RSpec.describe Mcp::BudgetAccuracyController, type: :controller do
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

    it 'returns 400 with a descriptive error when group_by is invalid' do
      get :show, params: { start_month: '2024-01', end_month: '2024-03', group_by: 'payee' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to include('group_by must be one of')
    end

    it 'returns 400 with a descriptive error when sort_by is invalid' do
      get :show, params: { start_month: '2024-01', end_month: '2024-03', sort_by: 'name' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to include('sort_by must be one of')
    end
  end

  describe 'GET #show — happy path' do
    let(:start_month) { '2024-01' }
    let(:end_month)   { '2024-03' }

    before do
      @category   = create(:allocation_category, budget_role: 'spending', name: 'Groceries')
      @bank_acct  = create(:bank_account)
      @budget     = create(:budget, start_date: '2024-01-01')
      @allocation = create(
        :allocation,
        name:                'Groceries',
        budget:              @budget,
        allocation_category: @category,
        amount:              50_000
      )
    end

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
      expect(json['amount_unit']).to eq('cents (divide by 100 for currency display)')
    end

    it 'returns a results array' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['results']).to be_an(Array)
    end

    it 'returns the group_by in the envelope' do
      get :show, params: { start_month: start_month, end_month: end_month, group_by: 'category' }
      json = JSON.parse(response.body)
      expect(json['group_by']).to eq('category')
    end

    it 'defaults group_by to allocation when not supplied' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['group_by']).to eq('allocation')
    end

    it 'defaults sort_by to pct_off when not supplied' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['sort_by']).to eq('pct_off')
    end

    it 'defaults variable_only to false when not supplied' do
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      expect(json['variable_only']).to eq(false)
    end

    it 'returns rows with the expected keys when data is present' do
      create(
        :transaction,
        allocation:       @allocation,
        transaction_date: '2024-01-15',
        withdrawal_amount: 60_000,
        deposit_amount:    0
      )
      get :show, params: { start_month: start_month, end_month: end_month }
      json = JSON.parse(response.body)
      row = json['results'].first
      expect(row.keys).to match_array(
        %w[group_label group_by months_counted median_abs_pct_off avg_abs_pct_off
           pct_months_within_10 direction total_budgeted_cents total_actual_cents net_deviation_cents]
      )
    end
  end
end
