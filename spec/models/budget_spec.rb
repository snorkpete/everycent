# == Schema Information
#
# Table name: budgets
#
#  id         :integer          not null, primary key
#  name       :string
#  start_date :date
#  end_date   :date
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'rails_helper'

describe Budget, :type => :model do
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
        kion_income = create(:recurring_income, name: "Kion's Salary", amount: 15_000_00)
        pat_income = create(:recurring_income, name: "Pat's Salary", amount: 20_000_00)
        aidan_income = create(:recurring_income, name: "Dad's Donation", amount: 400_00)
        @budget = create(:budget, start_date: '2015-01-23')
      end

      it 'is a list of incomes based on the current recurring incomes' do
        expect(@budget.incomes.size).to eq(3)
        expect(@budget.incomes.first.name).to eq "Kion's Salary"
      end

      it 'has a total income equal to the the sum of all the incomes' do
        expect(@budget.total_income).to eq(35_400_00)
      end
    end

    describe "allocations" do
      before :each do
        rent = create(:recurring_allocation, name: "Rent", amount: 2_200_00)
        food = create(:recurring_allocation, name: "Food", amount: 2_000_00)
        savings = create(:recurring_allocation, name: "Savings", amount: 1_400_00)
        dept = create(:recurring_allocation, name: "Dept", amount: 6_400_00)

        @budget = create(:budget, start_date: '2015-01-23')
      end

      it 'is a list of allocations based on the current recurring allocations' do
        expect(@budget.allocations.size).to eq(4)
        expect(@budget.allocations.first.name).to eq "Rent"
      end

      it 'has a total allocation equal to the the sum of all the allocations' do
        expect(@budget.total_allocation).to eq(12_000_00)
      end
    end
  end


  describe "balancing" do
    before :each do
      kion_income = create(:recurring_income, name: "Kion's Salary", amount: 15_000_00)
      pat_income = create(:recurring_income, name: "Pat's Salary", amount: 20_000_00)
      aidan_income = create(:recurring_income, name: "Dad's Donation", amount: 400_00)
      
      rent = create(:recurring_allocation, name: "Rent", amount: 2_200_00)
      food = create(:recurring_allocation, name: "Food", amount: 2_000_00)
      savings = create(:recurring_allocation, name: "Savings", amount: 1_400_00)
      dept = create(:recurring_allocation, name: "Dept", amount: 6_400_00)
    end

    context "when out of balance" do
      before :each do
        @budget = create(:budget, start_date: '2015-01-23')
      end

      it '#in_balance? is false' do
        expect(@budget).not_to be_in_balance
      end

      it 'knows how much it is under allocated by' 
    end

    context "when in balance" do
      it '#in_balance? is true' do
        @budget = create(:budget, start_date: '2015-01-23')
      end
      it 'knows how much it is over or under allocated by'
    end
  end
end