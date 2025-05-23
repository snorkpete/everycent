# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require 'spec_helper'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
# Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.maintain_test_schema!


module AuthHelper
  def auth_request(user)
    sign_in user
    request.headers.merge!(user.create_new_auth_token)
  end
end

# require any shared_examples - used to test concerns
Dir[Rails.root.join("spec/models/shared_examples/**/*.rb")].each {|f| require f}
Dir[Rails.root.join("spec/controllers/shared_examples/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  #config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  config.use_transactional_fixtures = true

  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, :type => :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # include factory girl syntax methods to simplify calls to factories
  config.include FactoryBot::Syntax::Methods

  # authentication helper methods
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include AuthHelper

  # Rails 7.1 compatibility
  config.before(:each, type: :controller) do
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  # Handle ActionController::Parameters in tests
  config.before(:each) do
    ActionController::Parameters.permit_all_parameters = true
  end

  # Rails 7.1 view path handling
  config.before(:each, type: :controller) do |example|
    if example.metadata[:render_views] && defined?(@controller) && @controller.respond_to?(:prepend_view_path)
      @controller.prepend_view_path(Rails.root.join('app/views'))
    end
  end

  # Explicitly disable view rendering globally
  config.render_views = false
end
