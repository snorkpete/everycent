require 'rails_helper'

RSpec.describe Mcp::BugReportsController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
  end

  describe 'GET #index' do
    context 'when not logged in' do
      it 'returns 401' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { auth_request(@user) }

      it 'returns 200' do
        get :index
        expect(response).to have_http_status(:ok)
      end

      it 'returns a bug_reports key in the response' do
        get :index
        json = JSON.parse(response.body)
        expect(json.key?('bug_reports')).to be true
        expect(json['bug_reports']).to be_an(Array)
      end

      it 'returns only open reports' do
        create(:bug_report, household: @household, reporter: @user, status: 'open')
        create(:bug_report, household: @household, reporter: @user, status: 'in_progress')
        create(:bug_report, household: @household, reporter: @user, status: 'fixed')

        get :index
        json = JSON.parse(response.body)
        expect(json['bug_reports'].size).to eq 1
        expect(json['bug_reports'].first['status']).to eq 'open'
      end

      it 'returns reports in most-recent-first order' do
        old_report = create(:bug_report, household: @household, reporter: @user, title: 'Old bug')
        new_report = create(:bug_report, household: @household, reporter: @user, title: 'New bug')
        old_report.update_columns(created_at: 2.days.ago)

        get :index
        json = JSON.parse(response.body)
        titles = json['bug_reports'].map { |r| r['title'] }
        expect(titles).to eq(['New bug', 'Old bug'])
      end

      it 'scopes to the current household' do
        create(:bug_report, household: @household, reporter: @user, title: 'My bug')

        other_household = create(:household)
        ActsAsTenant.with_tenant(other_household) do
          other_user = create(:user, household: other_household)
          create(:bug_report, household: other_household, reporter: other_user, title: 'Other bug')
        end

        get :index
        json = JSON.parse(response.body)
        titles = json['bug_reports'].map { |r| r['title'] }
        expect(titles).to eq(['My bug'])
      end

      it 'returns correct keys for each report' do
        create(:bug_report, household: @household, reporter: @user)

        get :index
        json = JSON.parse(response.body)
        row = json['bug_reports'].first
        expect(row.keys).to match_array(%w[id title description status reporter_name created_at])
      end
    end
  end

  describe 'POST #create' do
    let(:valid_params) do
      { bug_report: { title: 'Something broke', description: 'Steps to reproduce...' } }
    end

    context 'when not logged in' do
      it 'returns 401' do
        post :create, params: valid_params
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { auth_request(@user) }

      it 'returns 201 on success' do
        post :create, params: valid_params
        expect(response).to have_http_status(:created)
      end

      it 'creates a bug report with reporter set to current_user' do
        expect {
          post :create, params: valid_params
        }.to change(BugReport, :count).by(1)

        json = JSON.parse(response.body)
        expect(BugReport.find(json['id']).reporter).to eq @user
      end

      it 'ignores any reporter_id in params' do
        other_user = create(:user, household: @household)
        post :create, params: { bug_report: { title: 'Test', description: 'Details', reporter_id: other_user.id } }

        json = JSON.parse(response.body)
        expect(BugReport.find(json['id']).reporter).to eq @user
      end

      it 'returns the created record as JSON with correct keys' do
        post :create, params: valid_params
        json = JSON.parse(response.body)
        expect(json.keys).to match_array(%w[id title description status reporter_name created_at])
      end

      it 'returns 422 with errors when title is blank' do
        post :create, params: { bug_report: { title: '', description: 'Details' } }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end

      it 'returns 422 with errors when description is blank' do
        post :create, params: { bug_report: { title: 'A bug', description: '' } }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end
  end
end
