require 'rails_helper'

RSpec.describe Mcp::OverspendingAnalysisByAllocationController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
    auth_request(@user)
  end

  describe 'GET #show — period validation' do
    it 'returns 400 with the exact error body when period format is invalid' do
      get :show, params: { period: 'bad' }

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json).to eq('error' => 'Period must be in YYYY-MM format, e.g. 2024-03')
    end
  end

  describe 'GET #show — happy path' do
    let(:period) { '2024-02' }

    before do
      @category   = create(:allocation_category, budget_role: 'spending', name: 'Transport')
      @budget     = create(:budget, start_date: '2024-02-01')
      @bank_acct  = create(:bank_account)
      @allocation = create(
        :allocation,
        name:                'Car Insurance (Feb)',
        budget:              @budget,
        allocation_category: @category,
        amount:              30_000
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

    it 'returns nil category in the envelope when no category filter is passed' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      expect(json.key?('category')).to be true
      expect(json['category']).to be_nil
    end

    it 'returns the category filter value in the envelope when passed' do
      get :show, params: { period: period, category: 'Transport' }
      json = JSON.parse(response.body)
      expect(json['category']).to eq('Transport')
    end

    it 'returns the correct amount_unit string' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      expect(json['amount_unit']).to eq('*_cents = exact integer cents; *_display = ready-to-show currency string')
    end

    it 'returns an allocations array' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      expect(json['allocations']).to be_an(Array)
    end

    it 'returns rows with the expected keys' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      row = json['allocations'].first
      expect(row.keys).to match_array(
        %w[allocation category_id category
           budgeted_cents budgeted_display
           actual_cents actual_display
           amount_remaining_cents amount_remaining_display]
      )
    end

    it 'canonicalises allocation names in the response' do
      get :show, params: { period: period }
      json = JSON.parse(response.body)
      row = json['allocations'].first
      expect(row['allocation']).to eq('Car Insurance')
    end
  end
end
