source 'https://rubygems.org'
ruby '3.4.9'

gem 'bundler'
gem 'rails', '~> 7.2.0'
gem 'puma', '~> 5.6'
# Stay on Rack 2 through the Rails 8.1 upgrade. Rails 7.2/8.x allow rack >= 2.2.4;
# forced Rack 3 only lands in Rails 8.2. Puma 5.6 is incompatible with Rack 3, and
# Rack 3 forces rack-cors 3.0 + middleware breaking changes — deferred to the 8.2 task.
gem 'rack', '~> 2.2'
# gem 'bootsnap', require: false
gem 'bootsnap', '>= 1.8.1', require: false

# Ruby 3.4 promoted `observer` from a default gem to a bundled gem, so it must be
# declared explicitly. Required by factory_bot 6.2.0 (factory_bot/evaluation.rb)
# and drb/observer. Likely removable once factory_bot is bumped (>= 6.4.4) during
# the Rails upgrade — re-check then.
gem 'observer'

# Add responders gem since it's no longer included in Rails 7
gem 'responders'
gem 'rails-controller-testing'

group :development do
  gem 'annotate'
  gem 'lol_dba'
  # Remove meta_request as it's not compatible with Rails 7.1
  # gem 'meta_request', github: 'dejan/rails_panel', branch: 'master', glob: 'meta_request/meta_request.gemspec'
  # log where queries are being generated from in the code base
  gem 'active_record_query_trace'
  gem 'web-console'
end

# database gem
# Previously locked to pg 0.21 because current versions of pg gem had segfault issues
# Trying to use latest released pg gem
# gem 'pg', '~> 0.21'
gem 'pg', '~> 1.5.0'

# fix for time
gem 'tzinfo-data'

# json api building
gem 'active_model_serializers'

gem 'rack-cors', :require => 'rack/cors'

gem 'acts_as_tenant'

# Google OAuth ID token verification
gem 'googleauth'

#for heroku
group :production do
  gem 'newrelic_rpm'
end

group :development, :test do
  # Load .env for local development
  gem 'dotenv-rails'

  gem 'spring'
  gem 'spring-commands-rspec'
  #gem 'spring-watcher-listen'

  gem 'rspec-rails', '~> 7.1'
  gem 'factory_bot_rails'
  gem 'wdm', '>= 0.1.0' if Gem.win_platform?

end

group :test do
  gem 'faker', '~> 3.2'
  #gem 'capybara'
  gem 'database_cleaner-active_record', '~> 2.2'
  #gem 'selenium-webdriver'
end

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.1.2'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'
#gem 'eventmachine'
#gem 'thin'

# Deploy with Capistrano
# gem 'capistrano', :group => :development

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'
