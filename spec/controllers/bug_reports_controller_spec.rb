require 'rails_helper'

RSpec.describe BugReportsController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com')
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

      it 'returns an array' do
        get :index
        json = JSON.parse(response.body)
        expect(json).to be_an(Array)
      end

      it 'returns all bug reports regardless of status' do
        create(:bug_report, household: @household, reporter: @user, status: 'open')
        create(:bug_report, household: @household, reporter: @user, status: 'in_progress')
        create(:bug_report, household: @household, reporter: @user, status: 'fixed')

        get :index
        json = JSON.parse(response.body)
        expect(json.size).to eq 3
      end

      it 'returns reports in most-recent-first order' do
        old_report = create(:bug_report, household: @household, reporter: @user, title: 'Old bug')
        new_report = create(:bug_report, household: @household, reporter: @user, title: 'New bug')
        old_report.update_columns(created_at: 2.days.ago)

        get :index
        json = JSON.parse(response.body)
        titles = json.map { |r| r['title'] }
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
        titles = json.map { |r| r['title'] }
        expect(titles).to eq(['My bug'])
      end

      it 'returns correct keys for each report' do
        create(:bug_report, household: @household, reporter: @user)

        get :index
        json = JSON.parse(response.body)
        row = json.first
        expect(row.keys).to match_array(%w[id title description status reporter_name created_at])
      end

      it 'returns reporter full name when first_name and last_name are present' do
        create(:bug_report, household: @household, reporter: @user)

        get :index
        json = JSON.parse(response.body)
        expect(json.first['reporter_name']).to eq('Jane Smith')
      end

      it 'falls back to email when reporter has no name' do
        nameless_user = create(:user, household: @household, first_name: nil, last_name: nil, email: 'nameless@example.com')
        create(:bug_report, household: @household, reporter: nameless_user)

        get :index
        json = JSON.parse(response.body)
        nameless_report = json.find { |r| r['reporter_name'] == 'nameless@example.com' }
        expect(nameless_report).to be_present
      end
    end
  end

  describe 'PATCH #update' do
    before do
      @bug_report = create(:bug_report, household: @household, reporter: @user, status: 'open')
    end

    context 'when not logged in' do
      it 'returns 401' do
        patch :update, params: { id: @bug_report.id, bug_report: { status: 'fixed' } }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before { auth_request(@user) }

      it 'returns 200 on valid status transition' do
        patch :update, params: { id: @bug_report.id, bug_report: { status: 'in_progress' } }
        expect(response).to have_http_status(:ok)
      end

      it 'updates the status' do
        patch :update, params: { id: @bug_report.id, bug_report: { status: 'in_progress' } }
        expect(@bug_report.reload.status).to eq('in_progress')
      end

      it 'returns the updated record as JSON with correct keys' do
        patch :update, params: { id: @bug_report.id, bug_report: { status: 'fixed' } }
        json = JSON.parse(response.body)
        expect(json.keys).to match_array(%w[id title description status reporter_name created_at])
      end

      it 'returns the updated status in the response' do
        patch :update, params: { id: @bug_report.id, bug_report: { status: 'fixed' } }
        json = JSON.parse(response.body)
        expect(json['status']).to eq('fixed')
      end

      it 'returns 422 when an invalid status value is provided' do
        patch :update, params: { id: @bug_report.id, bug_report: { status: 'nonexistent' } }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['status']).to be_present
      end

      it 'ignores title and description in params (only status is permitted)' do
        original_title = @bug_report.title
        patch :update, params: { id: @bug_report.id, bug_report: { status: 'fixed', title: 'Hacked Title' } }
        expect(@bug_report.reload.title).to eq(original_title)
      end

      # No explicit rescue_from: a missing/cross-household id is unfindable under the
      # tenant scope and raises RecordNotFound, which Rails renders as 404 in production.
      it 'raises RecordNotFound when the bug report does not exist' do
        expect {
          patch :update, params: { id: 999_999, bug_report: { status: 'fixed' } }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'raises RecordNotFound for a bug report from a different household' do
        other_report = ActsAsTenant.with_tenant(create(:household)) do
          other_user = create(:user, household: ActsAsTenant.current_tenant)
          create(:bug_report, household: ActsAsTenant.current_tenant, reporter: other_user)
        end

        expect {
          patch :update, params: { id: other_report.id, bug_report: { status: 'fixed' } }
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
