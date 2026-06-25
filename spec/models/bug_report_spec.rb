require 'rails_helper'

RSpec.describe BugReport, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @user = create(:user, household: @household)
  end

  it 'is valid with required attributes' do
    report = build(:bug_report, household: @household, reporter: @user)
    expect(report).to be_valid
  end

  describe 'validations' do
    it 'is invalid without a title' do
      report = build(:bug_report, title: nil)
      expect(report).not_to be_valid
      expect(report.errors[:title]).to be_present
    end

    it 'is invalid without a description' do
      report = build(:bug_report, description: nil)
      expect(report).not_to be_valid
      expect(report.errors[:description]).to be_present
    end

    it 'is invalid without a status' do
      report = build(:bug_report, status: nil)
      expect(report).not_to be_valid
      expect(report.errors[:status]).to be_present
    end

    it 'is invalid with a status outside the allowed set' do
      report = build(:bug_report, status: 'nonexistent')
      expect(report).not_to be_valid
      expect(report.errors[:status]).to be_present
    end
  end

  describe 'scopes' do
    describe '.open' do
      it 'returns only open reports' do
        open_report = create(:bug_report, household: @household, reporter: @user, status: 'open')
        create(:bug_report, household: @household, reporter: @user, status: 'in_progress')
        create(:bug_report, household: @household, reporter: @user, status: 'fixed')

        expect(BugReport.open).to contain_exactly(open_report)
      end
    end

    describe '.recent_first' do
      it 'orders reports newest first' do
        old_report = create(:bug_report, household: @household, reporter: @user)
        new_report = create(:bug_report, household: @household, reporter: @user)
        old_report.update_columns(created_at: 2.days.ago)

        expect(BugReport.recent_first.first).to eq new_report
        expect(BugReport.recent_first.last).to eq old_report
      end
    end
  end

  describe '#reporter_name' do
    it 'joins first and last name when both are present' do
      @user.update!(first_name: 'Jane', last_name: 'Smith')
      report = build(:bug_report, reporter: @user)
      expect(report.reporter_name).to eq('Jane Smith')
    end

    it 'uses only the first name when the last name is blank' do
      @user.update!(first_name: 'Jane', last_name: nil)
      report = build(:bug_report, reporter: @user)
      expect(report.reporter_name).to eq('Jane')
    end

    it 'uses only the last name when the first name is blank' do
      @user.update!(first_name: nil, last_name: 'Smith')
      report = build(:bug_report, reporter: @user)
      expect(report.reporter_name).to eq('Smith')
    end

    it 'falls back to the email when no name is present' do
      @user.update!(first_name: nil, last_name: nil, email: 'nameless@example.com')
      report = build(:bug_report, reporter: @user)
      expect(report.reporter_name).to eq('nameless@example.com')
    end
  end

  describe 'tenant scoping' do
    it 'scopes reports to the current household' do
      create(:bug_report, household: @household, reporter: @user)

      second_household = create(:household)
      ActsAsTenant.with_tenant(second_household) do
        other_user = create(:user, household: second_household)
        create(:bug_report, household: second_household, reporter: other_user)
      end

      expect(BugReport.count).to eq 1
    end
  end
end
