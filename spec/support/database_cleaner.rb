RSpec.configure do |config|
  config.before(:suite) do
    # Skip cleaning system tables
    DatabaseCleaner.clean_with(:truncation, except: %w[ar_internal_metadata schema_migrations])
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each) do
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end
end 