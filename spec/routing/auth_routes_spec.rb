require 'rails_helper'

RSpec.describe 'Auth routes', type: :routing do
  # Regression guard for the ordering between `post '/auth/google'` and
  # `mount_devise_token_auth_for 'User', at: '/auth'` in config/routes.rb.
  #
  # devise_token_auth mounts a catch-all `/auth/:provider` route for its
  # omniauth redirect flow. If it's declared before our explicit
  # `post '/auth/google'`, the POST gets swallowed and redirected into
  # `/omniauth/google` — a route we don't define — and Google sign-in
  # silently breaks with a RoutingError. Our explicit route must come first.
  it 'routes POST /auth/google to Auth::GoogleController#create' do
    expect(post: '/auth/google').to route_to(
      controller: 'auth/google',
      action: 'create'
    )
  end
end
