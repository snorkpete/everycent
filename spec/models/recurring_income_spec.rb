# == Schema Information
#
# Table name: recurring_incomes
#
#  id              :integer          not null, primary key
#  name            :string
#  amount          :integer
#  frequency       :string           default("monthly")
#  bank_account_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

require 'rails_helper'

describe RecurringIncome, :type => :model do

  describe '#to_income' do
    before :each do
      @recurring_income = create(:recurring_income, 
                                name: 'Salary', 
                                amount: 1570000,
                                bank_account_id: 1)

      @income = @recurring_income.to_income
    end

    it 'returns an income' do
      expect(@income).to be_an Income
    end

    it 'creates an unsaved income' do
      expect(@income).not_to be_persisted
    end

    it 'copies the name to the new income' do
      expect(@income.name).to eq 'Salary'
    end

    it 'copies the amount to the new income' do
      expect(@income.amount).to eq 1570000
    end

    it 'copies the bank_account_id to the new income' do
      expect(@income.bank_account_id).to eq 1
    end
  end
end
