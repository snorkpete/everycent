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
    it 'clears tokens for all users' do
      household = ActsAsTenant.without_tenant { Household.create!(name: 'Test') }
      user = ActsAsTenant.with_tenant(household) do
        User.create!(
          email: 'tok@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          household: household
        )
      end
      # Give the user a live token via the normal flow
      ActsAsTenant.with_tenant(household) { user.create_new_auth_token }

      expect(user.reload.tokens).not_to be_nil

      expect { Rake::Task['auth:clear_tokens'].invoke }
        .to output(/Cleared auth tokens for 1 user/).to_stdout

      expect(user.reload.tokens).to be_blank
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
          expect(cypress.household.name).to eq('Cypress Test Household')

          claude = User.find_by(email: 'claude@everycent.dev')
          expect(claude).to be_present
          expect(claude.household).to eq(claude_household)
        end
      end

      it 'updates password for existing dev users in their respective households (idempotent)' do
        cypress_household = ActsAsTenant.without_tenant { Household.create!(name: 'Cypress Test Household') }
        claude_household = ActsAsTenant.without_tenant { Household.create!(name: 'Kion Dev Household') }

        ActsAsTenant.with_tenant(cypress_household) do
          User.create!(
            email: 'cypress@test.com',
            password: 'old_password',
            password_confirmation: 'old_password',
            household: cypress_household
          )
        end
        ActsAsTenant.with_tenant(claude_household) do
          User.create!(
            email: 'claude@everycent.dev',
            password: 'old_password',
            password_confirmation: 'old_password',
            household: claude_household
          )
        end

        expect { Rake::Task['auth:seed_dev_users'].invoke('Kion Dev Household') }
          .to output(/Updated password for: cypress@test\.com.*Updated password for: claude@everycent\.dev/m).to_stdout

        ActsAsTenant.with_tenant(cypress_household) do
          expect(User.find_by(email: 'cypress@test.com').valid_password?('CypressTest123!')).to be true
        end
        ActsAsTenant.with_tenant(claude_household) do
          expect(User.find_by(email: 'claude@everycent.dev').valid_password?('Claude123!')).to be true
        end
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
        User.create!(
          email: 'existing@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          household: household
        )
      end

      expect { Rake::Task['auth:add_user'].invoke('existing@example.com', 'Target Household') }
        .to raise_error(SystemExit)
    end
  end
end
