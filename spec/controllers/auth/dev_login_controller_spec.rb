require 'rails_helper'

RSpec.describe Auth::DevLoginController, type: :controller do
  # The dev_login route is only drawn when EVERYCENT_DEV_LOGIN='true' at boot,
  # so we draw it here for all controller spec examples.
  before do
    routes.draw { post '/auth/dev_login', to: 'auth/dev_login#create' }
  end

  after do
    Rails.application.reload_routes!
  end

  let(:household) { create(:household) }
  let(:user) { create(:user, household: household, email: 'dev@example.com') }

  describe 'POST #create' do
    context 'when EVERYCENT_DEV_LOGIN is set and env is non-production' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('EVERYCENT_DEV_LOGIN').and_return('true')
      end

      it 'returns a token for a known email' do
        user # ensure user exists
        post :create, params: { email: 'dev@example.com' }
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['success']).to be true
        expect(body['data']['token']).to be_present
        expect(body['data']['email']).to eq('dev@example.com')
      end

      it 'creates a session row for a known email' do
        user
        expect { post :create, params: { email: 'dev@example.com' } }
          .to change(Session, :count).by(1)
      end

      it 'returns 401 for an unknown email' do
        post :create, params: { email: 'nobody@example.com' }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when EVERYCENT_DEV_LOGIN is not set' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('EVERYCENT_DEV_LOGIN').and_return(nil)
      end

      it 'returns 404 not found' do
        post :create, params: { email: 'dev@example.com' }
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when EVERYCENT_DEV_LOGIN is set but env is production' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('EVERYCENT_DEV_LOGIN').and_return('true')
        allow(Rails.env).to receive(:production?).and_return(true)
      end

      it 'returns 404 not found' do
        post :create, params: { email: 'dev@example.com' }
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
