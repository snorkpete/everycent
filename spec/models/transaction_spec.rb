# == Schema Information
#
# Table name: transactions
#
#  id                      :integer          not null, primary key
#  description             :string
#  bank_ref                :string
#  bank_account_id         :integer
#  transaction_date        :date
#  withdrawal_amount       :integer
#  deposit_amount          :integer
#  payee_id                :integer
#  allocation_id           :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  payee_code              :string
#  payee_name              :string
#  sink_fund_allocation_id :integer
#  status                  :string
#  brought_forward_status  :string
#  household_id            :bigint(8)
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
            withdrawal_amount: 500, deposit_amount:0, allocation_id: 5 },

          { id: 5, description: 'second', transaction_date: '2015-01-09',
            withdrawal_amount: 0, deposit_amount: 1000, allocation_id: 5 }
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

      #expect(Transaction.all.size).to eq 4
      expect(transactions.size).to eq 2
    end

    describe "when Against Sink Funds" do
      before do
        @sink_fund = create(:bank_account, account_type: 'sink_fund',
                            closing_balance: 4000_00, closing_date: '2014-12-31')
        @params[:bank_account_id] = @sink_fund.id
      end
      it "removes previous transactions from sink_fund_allocations" do
        pending "test that we call sink_fund.remove_transactions_from_sink_fund_allocations(previous_transactions)"
        expect(false).to eq true
      end

      it "adds transactions from sink_fund_allocations" do
        pending "test that we call sink_fund.add_transactions_to_sink_fund_allocations(new_transactions)"
        expect(false).to eq true
      end

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

  describe "status" do
    it "defaults to paid for normal bank account transactions" do
      normal_bank_account = create(:bank_account, account_type: 'normal')
      transaction = create(:transaction, bank_account: normal_bank_account)
      expect(transaction.status).to eq 'paid'
    end

    it "defaults to paid for sink fund transactions" do
      sink_fund_account = create(:bank_account, account_type: 'sink_fund')
      transaction = create(:transaction, bank_account: sink_fund_account)
      expect(transaction.status).to eq 'paid'
    end

    it "defaults to unpaid for credit-card transactions" do
      credit_card = create(:bank_account, account_type: 'credit_card')
      transaction = create(:transaction, bank_account: credit_card)
      expect(transaction.status).to eq 'unpaid'
    end

    it "defaults to paid if transaction is a net deposit (i.e. payment)" do
      credit_card = create(:bank_account, account_type: 'credit_card')
      transaction = create(:transaction, bank_account: credit_card, deposit_amount: 100, withdrawal_amount: 10)
      expect(transaction.status).to eq 'paid'
    end

    it "does not change existing statuses if already set" do
      credit_card = create(:bank_account, account_type: 'credit_card')
      transaction = create(:transaction, bank_account: credit_card, status: 'paid')
      expect(transaction.status).to eq 'paid'
    end
  end

  describe "#net_amount" do
    it "equal to the deposit_amount - withdrawal_amount" do
      transaction = build(:transaction, withdrawal_amount: 50_00, deposit_amount: 60_00)
      expect(transaction.net_amount).to eq 10_00
    end
  end

  describe "#to_brought_forward_version" do
    before do
      @original_transaction = build(:transaction,
                                    bank_account_id: 22,
                                    description: 'Expensive Watch',
                                    bank_ref:'xxxx', withdrawal_amount: 30_000,
                                    deposit_amount: 5_00, allocation_id: 3)

      @date = Date.new(2015, 7, 23)
      @new_transaction = @original_transaction.to_brought_forward_version(@date)
    end

    it "creates a new transaction" do
      expect(@new_transaction.class).to eq Transaction
    end

    it "sets the bank account of the new transaction to the same as the original transaction" do
      expect(@new_transaction.bank_account_id).to eq @original_transaction.bank_account_id
    end

    it "sets the bank_ref the new transaction to the same as the original transaction" do
      expect(@new_transaction.bank_ref).to eq @original_transaction.bank_ref
    end

    it "sets the withdrawal_amount of the new transaction to the same as the original transaction" do

      expect(@new_transaction.withdrawal_amount).to eq @original_transaction.withdrawal_amount
    end

    it "sets the deposit_amount of the new transaction to the same as the original transaction" do
      expect(@new_transaction.deposit_amount).to eq @original_transaction.deposit_amount
    end

    it "sets the allocation of the new transaction to the same as the original transaction" do
      expect(@new_transaction.allocation_id).to eq @original_transaction.allocation_id
    end

    it "adds (B/F) to the description of the new transaction" do
      expect(@new_transaction.description).to eq "Expensive Watch (B/F)"
    end

    it "sets the transaction date of the new transaction to the passed date parameter" do
      expect(@new_transaction.transaction_date).to eq @date
    end

    it "sets the status of the new transaction to 'unpaid'" do
      expect(@new_transaction.status).to eq 'unpaid'
    end

    it "sets the brought_forward_status of the new transaction to 'added'" do
      expect(@new_transaction.brought_forward_status).to eq 'added'
    end

  end

end
