# == Schema Information
#
# Table name: transactions
#
#  id                :integer          not null, primary key
#  description       :string
#  bank_ref          :string
#  bank_account_id   :integer
#  transaction_date  :date
#  withdrawal_amount :integer
#  deposit_amount    :integer
#  payee_id          :integer
#  allocation_id     :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

require 'rails_helper'

RSpec.describe Transaction, :type => :model do
  describe '#update_with_params' do
    before :each do
      @budget = create(:budget, start_date: '2015-01-01')
      @bank_account = create(:bank_account)
      create(:transaction, description:'inside', transaction_date: '2015-01-10', bank_account_id: @bank_account.id)
      create(:transaction, description:'outside', transaction_date: '2015-03-01', bank_account_id: @bank_account.id)

      @params = {
        budget_id: @budget.id,
        bank_account_id: @bank_account.id,
        transactions: [
          { id: 5, description: 'first', transaction_date: '2015-01-15',
            withdrawal_amount: 500, deposit_amount:0, payee_name:'first payee', payee_code:'100', allocation_id: 5 },

          { id: 5, description: 'second', transaction_date: '2015-01-09',
            withdrawal_amount: 0, deposit_amount: 1000, payee_name:'second payee', payee_code:'300', allocation_id: 5 }
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

    it "calls the Payee#update_from_params method" do
      expect(Payee).to receive(:update_from_params).with({ payee_name:'first payee', payee_code:'100', allocation_id: 5}).once
      expect(Payee).to receive(:update_from_params).with({ payee_name:'second payee', payee_code:'300', allocation_id: 5}).once
      transactions = Transaction.update_with_params(@params)
    end

    it "updates the payee_code and payee_name fields" do
      transactions = Transaction.update_with_params(@params)
      expect(transactions[0].payee_code).to eq '100'
      expect(transactions[0].payee_name).to eq 'first payee'
    end
  end

  describe '#for_budget_and_bank' do
    before :each do
      @before = create(:transaction, description: 'before', transaction_date: '2015-01-10', bank_account_id: 5)
      @first = create(:transaction, description: 'first', transaction_date: '2015-01-11', bank_account_id: 5)
      @second = create(:transaction, description: 'second', transaction_date: '2015-01-12', bank_account_id: 5)
      @after = create(:transaction, description: 'after', transaction_date: '2015-03-15', bank_account_id: 5)
    end

    it 'excludes transactions with date before the budget start date' do
      # remember, the budget end date is set 1 month after start date
      budget = create(:budget, start_date: '2015-01-11') #end_date: '2015-01-31'
      transactions = Transaction.for_budget_and_bank(budget.id, 5)
      expect(transactions.size).to eq 2
      expect(transactions).to eq [@first, @second]
    end

    it 'excludes transactions with dates after the budget end date' do
      budget = create(:budget, start_date: '2015-01-01') #end_date: 2015-01-31
      transactions = Transaction.for_budget_and_bank(budget.id, 5)
      expect(transactions.size).to eq 3
      expect(transactions).to eq [@before, @first, @second]
    end

    it 'excludes transactions for other bank accounts' do
      budget = create(:budget, start_date: '2015-01-01') #end_date: 2015-01-31
      other_bank = create(:transaction, transaction_date: '2015-01-12', bank_account_id: 15)
      transactions = Transaction.for_budget_and_bank(budget.id, 5)
      expect(transactions.size).to eq 3
    end

    it 'does not check for null banks if bank_account_id param is null' do
      budget = create(:budget, start_date: '2015-01-01') #end_date: 2015-01-31
      nil_bank = create(:transaction, transaction_date: '2015-01-12', bank_account_id: nil)
      transactions = Transaction.for_budget_and_bank(budget.id, nil)
      expect(transactions.size).to eq 0
    end
  end

  describe "when Against Sink Funds" do
    before do
      @sink_fund = create(:bank_account, is_sink_fund: true,
                          closing_balance: 4000_00, closing_date: '2014-12-31')
      @sub_account = create(:sub_account, amount: 2000)
      @sink_fund.sub_accounts << @sub_account
    end
    it "updates the sink fund sub account balances" do
      transaction = create(:transaction, withdrawal_amount: 500_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @sub_account)
      expect(@sink_fund.current_balance).to eq 3500_00
      expect(@sub_account.amount).to eq 1500
    end

    context "if transaction deleted" do
      it "updates the sink fund sub account balances"
    end

    context "when transaction changed" do
      it "updates the sink fun sub account balances with new amount"
    end
  end
end
