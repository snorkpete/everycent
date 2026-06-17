require 'rails_helper'

RSpec.describe Mcp::SinkFundStatusController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
    auth_request(@user)
  end

  describe 'GET #show — validation errors' do
    it 'returns 400 when account param is not a string-like value' do
      # Rails coerces query params to strings, so we simulate a non-string by
      # exercising the model validator directly through the controller; since
      # params always arrive as strings from HTTP, we test the model in isolation
      # for non-string accounts but confirm the controller renders 400 on model errors.
      allow_any_instance_of(Mcp::SinkFundStatus).to receive(:valid?).and_return(false)
      allow_any_instance_of(Mcp::SinkFundStatus).to receive(:errors).and_return(
        instance_double(ActiveModel::Errors, full_messages: ['Account must be a string account name or omitted'])
      )
      get :show
      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to include('Account must be a string account name or omitted')
    end
  end

  describe 'GET #show — happy path' do
    it 'returns 200' do
      get :show
      expect(response).to have_http_status(:ok)
    end

    it 'returns the correct amount_unit string' do
      get :show
      json = JSON.parse(response.body)
      expect(json['amount_unit']).to eq('*_cents = exact integer cents; *_display = ready-to-show currency string')
    end

    it 'returns a results array' do
      get :show
      json = JSON.parse(response.body)
      expect(json['results']).to be_an(Array)
    end

    it 'returns include_closed in the envelope' do
      get :show
      json = JSON.parse(response.body)
      expect(json).to have_key('include_closed')
      expect(json['include_closed']).to eq(false)
    end

    it 'returns account_filter in the envelope' do
      get :show
      json = JSON.parse(response.body)
      expect(json).to have_key('account_filter')
      expect(json['account_filter']).to be_nil
    end

    it 'defaults include_closed to false when not supplied' do
      get :show
      json = JSON.parse(response.body)
      expect(json['include_closed']).to eq(false)
    end

    it 'accepts include_closed: true and reflects it in the envelope' do
      get :show, params: { include_closed: 'true' }
      json = JSON.parse(response.body)
      expect(json['include_closed']).to eq(true)
    end

    it 'reflects account_filter when an account param is supplied' do
      get :show, params: { account: 'Sink Fund Account' }
      json = JSON.parse(response.body)
      expect(json['account_filter']).to eq('Sink Fund Account')
    end
  end
end
