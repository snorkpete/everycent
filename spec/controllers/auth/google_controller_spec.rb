require 'rails_helper'

RSpec.describe Auth::GoogleController, type: :controller do
  render_views false

  let(:household) { create(:household) }
  let(:user) { create(:user, household: household, email: 'user@example.com') }

  let(:valid_payload) do
    {
      'email' => user.email,
      'sub' => 'google-uid-12345',
      'name' => 'Test User'
    }
  end

  before do
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  describe 'POST #create' do
    context 'when credential param is missing' do
      it 'returns unprocessable_entity' do
        post :create, params: {}
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an error message' do
        post :create, params: {}
        body = JSON.parse(response.body)
        expect(body['success']).to be false
        expect(body['errors']).to include('credential is required')
      end
    end

    context 'when the Google token is invalid' do
      before do
        allow(Google::Auth::IDTokens).to receive(:verify_oidc)
          .and_raise(Google::Auth::IDTokens::VerificationError, 'bad token')
      end

      it 'returns unauthorized' do
        post :create, params: { credential: 'invalid-token' }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns an error message' do
        post :create, params: { credential: 'invalid-token' }
        body = JSON.parse(response.body)
        expect(body['success']).to be false
        expect(body['errors']).to include('Invalid Google token')
      end
    end

    context 'when the email is not found in the database' do
      before do
        allow(Google::Auth::IDTokens).to receive(:verify_oidc).and_return(
          { 'email' => 'unknown@example.com', 'sub' => 'uid-999' }
        )
      end

      it 'returns unauthorized' do
        post :create, params: { credential: 'some-token' }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns an error message' do
        post :create, params: { credential: 'some-token' }
        body = JSON.parse(response.body)
        expect(body['success']).to be false
        expect(body['errors']).to include('No account found for this Google identity')
      end
    end

    context 'when the token is valid and the user exists' do
      before do
        allow(Google::Auth::IDTokens).to receive(:verify_oidc).and_return(valid_payload)
      end

      it 'returns success' do
        post :create, params: { credential: 'valid-token' }
        expect(response).to have_http_status(:ok)
      end

      it 'returns success: true in the body' do
        post :create, params: { credential: 'valid-token' }
        body = JSON.parse(response.body)
        expect(body['success']).to be true
      end

      it 'sets auth token headers in the response' do
        post :create, params: { credential: 'valid-token' }
        expect(response.headers['access-token']).to be_present
        expect(response.headers['client']).to be_present
        expect(response.headers['uid']).to be_present
      end

      it 'updates provider and uid on the user' do
        post :create, params: { credential: 'valid-token' }
        user.reload
        expect(user.provider).to eq 'google'
        expect(user.uid).to eq 'google-uid-12345'
      end

      it 'does not update provider/uid on subsequent sign-ins with same values' do
        user.update!(provider: 'google', uid: 'google-uid-12345')
        post :create, params: { credential: 'valid-token' }
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
