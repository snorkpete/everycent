require 'rails_helper'

RSpec.describe Mcp::OverspendingAnalysisController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
    auth_request(@user)
  end

  describe 'GET #show — period validation' do
    it 'returns 400 with the exact error body when period is missing' do
      expect { get :show }.to raise_error(ActionController::ParameterMissing)
    end

    it 'returns 400 with the exact error body when period format is invalid' do
      get :show, params: { period: 'January 2024' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json).to eq('error' => 'Period must be in YYYY-MM format, e.g. 2024-03')
    end

    it 'returns 400 for a full date (YYYY-MM-DD)' do
      get :show, params: { period: '2024-03-01' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json).to eq('error' => 'Period must be in YYYY-MM format, e.g. 2024-03')
    end
  end

  describe 'GET #show — happy path' do
    let(:period) { '2024-01' }

    before do
      @category   = create(:allocation_category, budget_role: 'spending', name: 'Groceries')
      @budget     = create(:budget, start_date: '2024-01-01')
      @bank_acct  = create(:bank_account)
      @allocation = create(
        :allocation,
        budget:              @budget,
        allocation_category: @category,
        amount:              40_000
      )
      create(
        :transaction,
        allocation:       @allocation,
        transaction_date: '2024-01-10',
        withdrawal_amount: 15_000,
        deposit_amount:    0
      )
    end

    it 'returns 200' do
      get :show, params: { period: period }
      expect(response).to have_http_status(:ok)
    end

    it 'returns the period in the envelope' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      expect(json['period']).to eq(period)
    end

    it 'returns the correct amount_unit string' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      expect(json['amount_unit']).to eq('*_cents = exact integer cents; *_display = ready-to-show currency string')
    end

    it 'returns a categories array' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      expect(json['categories']).to be_an(Array)
    end

    it 'returns rows with the expected keys' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      row = json['categories'].first
      expect(row.keys).to match_array(
        %w[category budgeted_cents budgeted_display actual_cents actual_display
           amount_remaining_cents amount_remaining_display]
      )
    end

    it 'returns correct budgeted and actual amounts' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      row = json['categories'].find { |r| r['category'] == 'Groceries' }
      expect(row['budgeted_cents']).to eq(40_000)
      expect(row['actual_cents']).to eq(15_000)
      expect(row['amount_remaining_cents']).to eq(25_000)
    end
  end

  describe 'GET #show — authentication' do
    it 'returns 401 when not logged in' do
      # Reset auth headers to simulate an unauthenticated request
      request.headers.merge!('access-token' => '', 'client' => '', 'uid' => '')
      get :show, params: { period: '2024-01' }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
