source 'https://rubygems.org'
ruby '2.5.1'

gem 'rails', '5.2.0'
gem 'puma'
gem 'bootsnap', require: false

gem 'rails-controller-testing'

group :development do
  gem 'annotate'
  gem 'lol_dba'
  gem 'meta_request'
  # log where queries are being generated from in the code base
  gem 'active_record_query_trace'
  gem 'web-console'
end

# database gem
gem 'pg', '~> 0.21'
# gem 'pg'

# fix for time
gem 'tzinfo-data'

# authentication - omniauth is a dependency of devise_token_auth
gem 'omniauth'
gem 'devise_token_auth'

# json api building
gem 'active_model_serializers'

gem 'rack-cors', :require => 'rack/cors'

gem 'acts_as_tenant'

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
  gem 'terminal-notifier-guard'

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
