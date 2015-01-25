source 'https://rubygems.org'


gem 'rails', '4.2.0.rc3'

gem 'rails-api'

#gem 'spring', :group => :development
gem 'annotate', :group => :development


gem 'sqlite3', :group => :development
gem 'pg', :group => :production

# fix for time
gem 'tzinfo-data'

# authentication - omniauth is a dependency of devise_token_auth
gem 'omniauth'
gem 'devise_token_auth'

# json api building
gem 'active_model_serializers'
gem 'responders', '~> 2.0'


# web server
gem 'passenger'

group :development, :test do
  gem 'guard-spork'
  gem 'guard-bundler'
  gem 'guard-rails'
  #gem 'guard-rspec'
  gem 'spork-rails'
  gem 'rspec-rails'
  gem 'factory_girl_rails'
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
