require 'rails_helper'

RSpec.describe Transaction, :type => :model do
  describe '#update_with_params' do
    before :each do
      @bank_account = create(:bank_account)
      create(:transaction, description:'inside', transaction_date: '2015-01-10', bank_account_id: @bank_account.id)
      create(:transaction, description:'outside', transaction_date: '2015-03-01', bank_account_id: @bank_account.id)

      @params = {
        start_date: '2015-01-10',
        end_date: '2015-02-09',
        bank_account_id: @bank_account.id,
        transactions: [
          { id: 5, description: 'first', transaction_date: '2015-01-15',
            withdrawal_amount: 500, deposit_amount:0, payee_id: 3, allocation_id: 5 },

          { id: 5, description: 'second', transaction_date: '2015-02-09',
            withdrawal_amount: 0, deposit_amount: 1000, payee_id: 3, allocation_id: 5 }
        ]
      }
    end

    it 'removes existing transactions within the period and adds new transactions' do
      @transactions = Transaction.update_with_params(@params)
      expect(@transactions.size).to eq 2
    end

    it "ignores existing transactions that do not fit in the period" do
      Transaction.update_with_params(@params)
      expect(Transaction.all.size).to eq 3
    end

    it "creates the transactions with the indicated bank account" do
      transactions = Transaction.update_with_params(@params)
      transaction = transactions.last

      expect(transaction.bank_account_id).to eq @bank_account.id
    end

    it "ignores transactions from other banks" do
      create(:transaction, transaction_date: '2015-01-10', bank_account_id: 200)
      transactions = Transaction.update_with_params(@params)

      expect(Transaction.all.size).to eq 4
      expect(transactions.size).to eq 2
    end
  end
end
