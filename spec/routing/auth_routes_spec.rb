require 'rails_helper'

RSpec.describe 'Auth routes', type: :routing do
  it 'routes POST /auth/google to Auth::GoogleController#create' do
    expect(post: '/auth/google').to route_to(controller: 'auth/google', action: 'create')
  end

  it 'routes DELETE /auth/sign_out to Auth::SessionsController#destroy' do
    expect(delete: '/auth/sign_out').to route_to(controller: 'auth/sessions', action: 'destroy')
  end

  it 'routes GET /auth/validate to Auth::SessionsController#show' do
    expect(get: '/auth/validate').to route_to(controller: 'auth/sessions', action: 'show')
  end
end
