# == Schema Information
#
# Table name: budgets
#
#  id           :integer          not null, primary key
#  name         :string
#  start_date   :date
#  end_date     :date
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  status       :string           default("open")
#  household_id :bigint(8)
#

require 'rails_helper'
require 'models/shared_examples/weekly_budget_spec'

describe Budget, :type => :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  it 'is valid with a start date' do
    @budget = build(:budget, start_date: '2015-01-01')
    expect(@budget).to be_valid
  end

  it 'is invalid without a start date' do
    @budget = build(:budget, start_date: nil)
    expect(@budget).not_to be_valid
  end

  describe 'on creation' do
    before :each do
      @budget = create(:budget, start_date: '2015-01-01')
    end

    it 'determines end date as one month from start date' do
      expect(@budget.end_date).to eq(Date.parse('2015-01-31'))
    end

    it 'determines its name from the start date' do
      expect(@budget.name).to eq('Jan 01 - Jan 31, 2015')

      new_budget = create(:budget, start_date: '2015-01-23')
      expect(new_budget.name).to eq('Jan 23 - Feb 22, 2015')
    end

    describe "incomes" do
      before :each do
        @budget = create(:budget, start_date: '2015-01-23')
        kion_income = create(:income, budget: @budget, name: "Kion's Salary", amount: 15_000_00)
        pat_income = create(:income, budget: @budget, name: "Pat's Salary", amount: 20_000_00)
        aidan_income = create(:income, budget: @budget, name: "Dad's Donation", amount: 400_00)
      end

      it 'has a total income equal to the the sum of all the incomes' do
        expect(@budget.total_income).to eq(35_400_00)
      end
    end

    describe "allocations" do
      before :each do
        @budget = create(:budget, start_date: '2015-01-23')
        rent = create(:allocation, budget: @budget, name: "Rent", amount: 2_200_00)
        food = create(:allocation, budget: @budget, name: "Food", amount: 2_000_00)
        savings = create(:allocation, budget: @budget, name: "Savings", amount: 1_400_00)
        debt = create(:allocation, budget: @budget, name: "Debt", amount: 6_400_00)

      end

      it 'has a total allocation equal to the the sum of all the allocations' do
        expect(@budget.total_allocation).to eq(12_000_00)
      end
    end
  end

  describe "#copy" do
    before :each do
      @budget = create(:budget, start_date: '2015-01-23')
      @kion_income = create(:income, budget: @budget, name: "Kion's Salary", amount: 15_000_00)
      @pat_income = create(:income, budget: @budget, name: "Pat's Salary", amount: 20_000_00)
      @savings = create(:allocation, budget: @budget, name: "Savings", amount: 1_400_00)
      @debt = create(:allocation, budget: @budget, name: "Debt", amount: 6_400_00)

      @new_budget = @budget.copy
    end

    it "creates a new persisted budget" do
      expect(@new_budget).to be_instance_of(Budget)
      expect(@new_budget).to be_persisted
    end

    it "returns a budget with start date one month later" do
      expect(@new_budget.start_date).to eq(Date.parse('2015-02-23'))
    end

    it "only copies incomes from budget" do
      expect(@new_budget.incomes.size).to eq 2
    end

    it "correctly copies the incomes" do
      expect(@new_budget.incomes.first.name).to eq "Kion's Salary"
    end

    it "only copies allocations from budget" do
      expect(@new_budget.allocations.size).to eq 2
    end

    it "correctly copies the allocations" do
      expect(@new_budget.allocations.second.name).to eq "Debt"
    end
  end

  describe ".current" do
    before do
      @closed = create(:budget, status: 'closed', start_date: '2015-01-01')
      @open = create(:budget, status: 'open', start_date: '2015-02-01')
    end
    it "returns the latest open budget" do
      expect(Budget.current.id).to eq(@open.id)
    end

    it "finds the earliest open budet if multiple ones are open" do
      @later_open = create(:budget, status: 'open', start_date: '2015-03-01')
      expect(Budget.current.id).to eq(@open.id)
    end
  end

  describe ".mass_update" do
    context "when type is 'income'" do
      before do
        @params = { type: 'income', allocation: 'Test', amounts: [] }
      end

      it "calls Income.mass_update" do
        expect(Income).to receive(:mass_update).with(@params).and_return(true)
        Budget.mass_update(@params)
      end

      it "does not call Allocation.mass_update" do
        expect(Allocation).not_to receive(:mass_update)
        Budget.mass_update(@params)
      end
    end

    context "when type is 'allocation'" do
      before do
        @params = { type: 'allocation', income: 'Test', amounts: [] }
      end

      it "calls Allocation.mass_update" do
        expect(Allocation).to receive(:mass_update).with(@params).and_return(true)
        Budget.mass_update(@params)
      end

      it "does not call Income.mass_update" do
        expect(Income).not_to receive(:mass_update)
        Budget.mass_update(@params)
      end
    end
  end

  include_examples "WeeklyBudget"
end
