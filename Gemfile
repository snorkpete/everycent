source 'https://rubygems.org'
ruby '2.2.10'

gem 'rails', '5.1.6'
gem 'puma'

gem 'rails-controller-testing'
#gem 'rails-api'

group :development do
  gem 'annotate'
  gem 'lol_dba'
  gem 'meta_request'
  # log where queries are being generated from in the code base
  gem 'active_record_query_trace'
  gem 'web-console', '~> 2.0'
end

# database gem
gem 'pg', '~> 0.21'

# fix for time
gem 'tzinfo-data'

# authentication - omniauth is a dependency of devise_token_auth
gem 'omniauth'
gem 'devise_token_auth'

# json api building
gem 'active_model_serializers'

gem 'rack-cors', :require => 'rack/cors'


#for heroku
group :production do
  gem 'rails_12factor'
  gem 'newrelic_rpm'
end

group :development, :test do
  gem 'spring'
  gem 'spring-commands-rspec'
  #gem 'spring-watcher-listen'

  gem 'guard-bundler'
  gem 'guard-rails'
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'guard-rspec'
  gem 'wdm', '>= 0.1.0' if Gem.win_platform?
  gem 'ruby_gntp'
end

group :test do
  gem 'faker'
  #gem 'capybara'
  gem 'database_cleaner'
  gem 'launchy'
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
