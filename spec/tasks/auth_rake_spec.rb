require 'rails_helper'
require 'rake'

RSpec.describe 'auth rake tasks' do
  before :all do
    Rails.application.load_tasks
  end

  before :each do
    ActsAsTenant.without_tenant { User.delete_all }
    ActsAsTenant.without_tenant { Household.delete_all }
    # Re-enable tasks after each run so they can be called again
    Rake::Task.tasks.each(&:reenable)
  end

  describe 'auth:clear_tokens' do
    it 'clears all sessions' do
      household = ActsAsTenant.without_tenant { Household.create!(name: 'Test') }
      user = ActsAsTenant.with_tenant(household) do
        User.create!(email: 'tok@example.com', household: household, provider: 'google', uid: 'tok@example.com')
      end
      Session.start!(user: user)

      expect { Rake::Task['auth:clear_tokens'].invoke }
        .to output(/Cleared 1 session/).to_stdout

      expect(Session.count).to eq(0)
    end
  end

  describe 'auth:seed_dev_users' do
    context 'in development environment' do
      it 'seeds cypress into its own household and claude into the specified household' do
        expect(Rails.env).not_to eq('production')

        claude_household = ActsAsTenant.without_tenant { Household.create!(name: 'Kion Dev Household') }

        expect { Rake::Task['auth:seed_dev_users'].invoke('Kion Dev Household') }
          .to output(/Created user: cypress@test\.com.*Created user: claude@everycent\.dev/m).to_stdout

        ActsAsTenant.without_tenant do
          cypress = User.find_by(email: 'cypress@test.com')
          expect(cypress).to be_present
          expect(cypress.provider).to eq 'google'
          expect(cypress.uid).to eq 'cypress@test.com'
          expect(cypress.household.name).to eq('Cypress Test Household')

          claude = User.find_by(email: 'claude@everycent.dev')
          expect(claude).to be_present
          expect(claude.provider).to eq 'google'
          expect(claude.uid).to eq 'claude@everycent.dev'
          expect(claude.household).to eq(claude_household)
        end
      end

      it 'handles existing users without error (idempotent)' do
        cypress_household = ActsAsTenant.without_tenant { Household.create!(name: 'Cypress Test Household') }
        claude_household = ActsAsTenant.without_tenant { Household.create!(name: 'Kion Dev Household') }

        ActsAsTenant.with_tenant(cypress_household) do
          User.create!(email: 'cypress@test.com', household: cypress_household, provider: 'google', uid: 'cypress@test.com')
        end
        ActsAsTenant.with_tenant(claude_household) do
          User.create!(email: 'claude@everycent.dev', household: claude_household, provider: 'google', uid: 'claude@everycent.dev')
        end

        expect { Rake::Task['auth:seed_dev_users'].invoke('Kion Dev Household') }
          .to output(/Updated user: cypress@test\.com.*Updated user: claude@everycent\.dev/m).to_stdout
      end

      it 'aborts when claude_household_name is blank' do
        expect { Rake::Task['auth:seed_dev_users'].invoke }
          .to raise_error(SystemExit)
      end

      it 'aborts when the specified claude household does not exist' do
        expect { Rake::Task['auth:seed_dev_users'].invoke('Nonexistent Household') }
          .to raise_error(SystemExit)
      end
    end
  end

  describe 'auth:add_user' do
    it 'creates a user in the specified household' do
      household = ActsAsTenant.without_tenant { Household.create!(name: 'Target Household') }

      expect { Rake::Task['auth:add_user'].invoke('newprod@example.com', 'Target Household') }
        .to output(/Created user: newprod@example\.com in household: Target Household/).to_stdout

      user = ActsAsTenant.without_tenant { User.find_by(email: 'newprod@example.com') }
      expect(user).to be_present
      expect(user.provider).to eq 'google'
      expect(user.household).to eq(household)
    end

    it 'aborts when email is blank' do
      ActsAsTenant.without_tenant { Household.create!(name: 'Target Household') }
      expect { Rake::Task['auth:add_user'].invoke('', 'Target Household') }
        .to raise_error(SystemExit)
    end

    it 'aborts when household_name is blank' do
      expect { Rake::Task['auth:add_user'].invoke('user@example.com', '') }
        .to raise_error(SystemExit)
    end

    it 'aborts when the specified household does not exist' do
      expect { Rake::Task['auth:add_user'].invoke('user@example.com', 'Nonexistent Household') }
        .to raise_error(SystemExit)
    end

    it 'aborts when a user with the same email already exists in that household' do
      household = ActsAsTenant.without_tenant { Household.create!(name: 'Target Household') }
      ActsAsTenant.with_tenant(household) do
        User.create!(email: 'existing@example.com', household: household, provider: 'google', uid: 'existing@example.com')
      end

      expect { Rake::Task['auth:add_user'].invoke('existing@example.com', 'Target Household') }
        .to raise_error(SystemExit)
    end
  end
end
