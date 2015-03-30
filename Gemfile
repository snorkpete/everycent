source 'https://rubygems.org'
ruby '2.2.1'
#ruby '2.1.5'


gem 'rails', '~> 4.2'
gem 'puma'

gem 'rails-api'

#gem 'spring', :group => :development
group :development do
  gem 'annotate'
  gem 'lol_dba'
  gem 'meta_request'
end

# database gem
gem 'pg'

# fix for time
gem 'tzinfo-data'

# authentication - omniauth is a dependency of devise_token_auth
gem 'omniauth'
gem 'devise_token_auth'

# json api building
gem 'active_model_serializers'
gem 'responders'


# web server
#gem 'passenger'

#for heroku
gem 'rails_12factor'

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
