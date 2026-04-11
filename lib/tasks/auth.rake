namespace :auth do
  desc 'Clear all auth tokens from every user. Safe to run in any environment.'
  task clear_tokens: :environment do
    count = User.update_all(tokens: nil)
    puts "Cleared auth tokens for #{count} user(s)."
  end

  desc 'Seed dev/test users with known passwords. Aborts if run in production.'
  task :seed_dev_users, [:claude_household_name] => :environment do |_t, args|
    abort 'This task cannot be run in production.' if Rails.env.production?

    claude_household_name = args[:claude_household_name]
    if claude_household_name.blank?
      abort 'Usage: rake auth:seed_dev_users["<your-household-name>"] — the claude dev user gets scoped to this household so agents can inspect real dev data.'
    end

    # Cypress tests run against a fresh, dedicated household so they never
    # touch real dev data. Create it if missing.
    cypress_household = ActsAsTenant.without_tenant do
      Household.find_or_create_by!(name: 'Cypress Test Household')
    end
    ActsAsTenant.with_tenant(cypress_household) do
      user = User.find_by(email: 'cypress@test.com')
      if user.nil?
        User.create!(
          email: 'cypress@test.com',
          password: 'CypressTest123!',
          password_confirmation: 'CypressTest123!',
          household: cypress_household
        )
        puts "Created user: cypress@test.com in household: #{cypress_household.name}"
      else
        user.password = 'CypressTest123!'
        user.password_confirmation = 'CypressTest123!'
        user.save!
        puts "Updated password for: cypress@test.com"
      end
    end

    # Claude's test user is scoped to the developer's own household so agents
    # can poke around real dev data when debugging. The caller must pass the
    # household name explicitly — we never silently pick a default.
    claude_household = ActsAsTenant.without_tenant do
      Household.find_by(name: claude_household_name)
    end
    abort "Household #{claude_household_name.inspect} not found — seed it first or fix the name." if claude_household.nil?

    ActsAsTenant.with_tenant(claude_household) do
      user = User.find_by(email: 'claude@everycent.dev')
      if user.nil?
        User.create!(
          email: 'claude@everycent.dev',
          password: 'Claude123!',
          password_confirmation: 'Claude123!',
          household: claude_household
        )
        puts "Created user: claude@everycent.dev in household: #{claude_household.name}"
      else
        user.password = 'Claude123!'
        user.password_confirmation = 'Claude123!'
        user.save!
        puts "Updated password for: claude@everycent.dev"
      end
    end
  end

  desc 'Create a user in a specific household (no password). For production use via heroku run rake.'
  task :add_user, [:email, :household_name] => :environment do |_t, args|
    email = args[:email]
    household_name = args[:household_name]

    if email.blank? || household_name.blank?
      abort 'Usage: rake auth:add_user[user@example.com,"<household-name>"]'
    end

    household = ActsAsTenant.without_tenant do
      Household.find_by(name: household_name)
    end
    abort "Household #{household_name.inspect} not found." if household.nil?

    ActsAsTenant.with_tenant(household) do
      if User.find_by(email: email)
        abort "A user with email #{email} already exists in household #{household.name.inspect}."
      end

      user = User.new(email: email, household: household)
      user.provider = 'google'
      user.uid = email
      user.save!
      puts "Created user: #{email} in household: #{household.name}"
    end
  end
end
