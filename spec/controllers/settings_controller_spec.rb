require 'rails_helper'

describe SettingsController do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe '#create' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        post :create, params: { family_type: 'couple', husband: 'John', wife: 'Jane' }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when logged in' do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'returns a successful response' do
        post :create, params: { family_type: 'couple', husband: 'John', wife: 'Jane' }
        expect(response).to be_successful
      end

      it 'returns the saved settings object, not { success: true }' do
        post :create, params: { family_type: 'couple', husband: 'John', wife: 'Jane' }

        json = JSON.parse(response.body)
        expect(json).to include('family_type' => 'couple', 'husband' => 'John', 'wife' => 'Jane')
        expect(json).not_to have_key('success')
      end

      it 'persists and returns updated settings for single family type' do
        post :create, params: { family_type: 'single', single_person: 'Alex' }

        json = JSON.parse(response.body)
        expect(json).to include('family_type' => 'single', 'single_person' => 'Alex')
      end
    end
  end
end
