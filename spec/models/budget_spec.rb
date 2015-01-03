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

    #TODO to remove - kinda redundant
    it 'has a list of incomes' do
      expect(@budget.incomes).to eq([])
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

    it 'has a list of allocations'
    it 'has a list of allocations based on the current recurring allocations'
  end

  it 'has a total of the incomes attached to the budget'
  it 'has a total of the allocations attached to the budget'

  it 'knows if it is in balance or not'
  it 'knows how much it is over or under allocated by'
end
