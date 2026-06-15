require 'rails_helper'

RSpec.describe Auth::SessionsController, type: :controller do
  let(:household) { create(:household) }
  let(:user) { create(:user, household: household) }

  describe 'DELETE #destroy' do
    context 'when authenticated' do
      before { auth_request(user) }

      it 'returns 204 no content' do
        delete :destroy
        expect(response).to have_http_status(:no_content)
      end

      it 'destroys the current session' do
        expect { delete :destroy }.to change(Session, :count).by(-1)
      end
    end

    context 'token invalidation after sign-out' do
      it 'rejects the same token on a subsequent request' do
        _, token = Session.start!(user: user)
        request.headers['Authorization'] = "Bearer #{token}"

        delete :destroy
        expect(response).to have_http_status(:no_content)

        # Reset the controller between requests by re-sending the same token
        request.headers['Authorization'] = "Bearer #{token}"
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        delete :destroy
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET #show' do
    context 'when authenticated' do
      before { auth_request(user) }

      it 'returns 200 ok' do
        get :show
        expect(response).to have_http_status(:ok)
      end

      it 'returns the user email' do
        get :show
        body = JSON.parse(response.body)
        expect(body['success']).to be true
        expect(body['data']['email']).to eq(user.email)
      end
    end

    context 'when not authenticated' do
      it 'returns 401 unauthorized' do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
