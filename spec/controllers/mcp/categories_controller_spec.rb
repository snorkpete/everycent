require 'rails_helper'

RSpec.describe Mcp::CategoriesController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
    auth_request(@user)
  end

  describe 'GET #index — happy path' do
    it 'returns 200' do
      get :index
      expect(response).to have_http_status(:ok)
    end

    it 'returns a categories key in the envelope' do
      get :index
      json = JSON.parse(response.body)
      expect(json.key?('categories')).to be true
      expect(json['categories']).to be_an(Array)
    end

    it 'returns an empty array when there are no categories' do
      get :index
      json = JSON.parse(response.body)
      expect(json['categories']).to eq([])
    end

    it 'returns rows with id, name, and budget_role' do
      create(:allocation_category, name: 'Food', budget_role: 'spending')
      get :index
      json = JSON.parse(response.body)
      row = json['categories'].first
      expect(row.keys).to match_array(%w[id name budget_role])
    end

    it 'returns categories ordered by name' do
      create(:allocation_category, name: 'Utilities', budget_role: 'spending')
      create(:allocation_category, name: 'Groceries', budget_role: 'spending')
      get :index
      json = JSON.parse(response.body)
      names = json['categories'].map { |c| c['name'] }
      expect(names).to eq(%w[Groceries Utilities])
    end

    it 'scopes categories to the authenticated household' do
      create(:allocation_category, name: 'My Category', budget_role: 'spending')
      other_household = create(:household)
      ActsAsTenant.with_tenant(other_household) do
        create(:allocation_category, name: 'Other Category', budget_role: 'spending')
      end

      get :index
      json = JSON.parse(response.body)
      names = json['categories'].map { |c| c['name'] }
      expect(names).to eq(['My Category'])
    end
  end

  describe 'GET #index — authentication' do
    it 'returns 401 when not logged in' do
      request.headers.merge!('access-token' => '', 'client' => '', 'uid' => '')
      get :index
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
