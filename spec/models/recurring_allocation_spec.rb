require 'rails_helper'

describe RecurringAllocation, :type => :model do

  describe '#to_allocation' do
    before :each do
      @recurring_allocation = create(:recurring_allocation, 
                                name: 'Aidan Savings', 
                                allocation_type: 'savings',
                                amount: 800_00,
                                is_standing_order: true,
                                bank_account_id: 3)

      @allocation = @recurring_allocation.to_allocation
    end

    it 'returns an allocation' do
      expect(@allocation).to be_an Allocation
    end

    it 'creates an unsaved allocation' do
      expect(@allocation).not_to be_persisted
    end

    it 'copies the name to the new allocation' do
      expect(@allocation.name).to eq 'Aidan Savings'
    end

    it 'copies the amount to the new allocation' do
      expect(@allocation.amount).to eq 800_00
    end

    it 'copies the allocation type to the new allocation' do
      expect(@allocation.allocation_type).to eq 'savings'
    end

    it 'copies the standing order flagtype to the new allocation' do
      expect(@allocation.is_standing_order?).to eq true
    end

    it 'copies the bank_account_id to the new allocation' do
      expect(@allocation.bank_account_id).to eq 3
    end
  end
end
