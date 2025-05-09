source 'https://rubygems.org'
ruby '3.2.3'

gem 'bundler'
gem 'rails', '~> 6.1.7'
gem 'puma'
# gem 'bootsnap', require: false
gem 'bootsnap', '>= 1.8.1', require: false
gem 'nio4r', '~> 2.7.0'

gem 'rails-controller-testing'

# fix for deprecated/removed mimemagic 3.2
gem 'mimemagic', github: 'mimemagicrb/mimemagic', ref: '01f92d86d15d85cfd0f20dabd025dcbd36a8a60f'


group :development do
  gem 'annotate'
  gem 'lol_dba'
  # fix for SystemStackError: stack level too deep with Rails 6.1
  # See: https://github.com/dejan/rails_panel/issues/178#issuecomment-879994647
  gem 'meta_request', github: 'dejan/rails_panel', branch: 'master', glob: 'meta_request/meta_request.gemspec'
  # gem 'meta_request'
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
  gem 'faker', '~> 3.2.0'
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
