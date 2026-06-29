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
#  is_manual_adjustment    :boolean          default(FALSE)
#

require 'rails_helper'

RSpec.describe Transaction, :type => :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe '#update_with_params' do
    before :each do
      @budget = create(:budget, start_date: '2015-01-01')
      @bank_account = create(:bank_account)
      @allocation = create(:allocation, bank_account: @bank_account)
      @inside = create(:transaction, description:'inside', transaction_date: '2015-01-10', bank_account_id: @bank_account.id)
      @outside = create(:transaction, description:'outside', transaction_date: '2015-03-01', bank_account_id: @bank_account.id)

      @params = {
        budget_id: @budget.id,
        bank_account_id: @bank_account.id,
        transactions: [
          { id: @inside.id, description: 'first', transaction_date: '2015-01-15',
            withdrawal_amount: 500, deposit_amount:0, allocation_id: @allocation.id },

          { id: @outside.id, description: 'second', transaction_date: '2015-01-09',
            withdrawal_amount: 0, deposit_amount: 1000, allocation_id: @allocation.id }
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
      other_bank_account = create(:bank_account)
      create(:transaction, transaction_date: '2015-01-10', bank_account_id: other_bank_account.id)
      transactions = Transaction.update_with_params(@params)

      #expect(Transaction.all.size).to eq 4
      expect(transactions.size).to eq 2
    end

    it "rolls back deletions when transaction creation fails" do
      original_count = Transaction.for_budget_and_bank(@budget.id, @bank_account.id).count
      expect(original_count).to eq 1

      allow(Transaction).to receive(:create).and_raise(RuntimeError, "simulated failure")

      expect { Transaction.update_with_params(@params) rescue nil }.not_to change {
        Transaction.for_budget_and_bank(@budget.id, @bank_account.id).count
      }
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
      @bank_account = create(:bank_account)
      @before = create(:transaction, description: 'before', transaction_date: '2015-01-10', bank_account_id: @bank_account.id)
      @first = create(:transaction, description: 'first', transaction_date: '2015-01-11', bank_account_id: @bank_account.id)
      @second = create(:transaction, description: 'second', transaction_date: '2015-01-12', bank_account_id: @bank_account.id)
      @after = create(:transaction, description: 'after', transaction_date: '2015-03-15', bank_account_id: @bank_account.id)
    end

    it 'excludes transactions with date before the budget start date' do
      # remember, the budget end date is set 1 month after start date
      budget = create(:budget, start_date: '2015-01-11') #end_date: '2015-01-31'
      transactions = Transaction.for_budget_and_bank(budget.id, @bank_account.id)
      expect(transactions.size).to eq 2
      expect(transactions).to eq [@first, @second]
    end

    it 'excludes transactions with dates after the budget end date' do
      budget = create(:budget, start_date: '2015-01-01') #end_date: 2015-01-31
      transactions = Transaction.for_budget_and_bank(budget.id, @bank_account.id)
      expect(transactions.size).to eq 3
      expect(transactions).to eq [@before, @first, @second]
    end

    it 'excludes transactions for other bank accounts' do
      budget = create(:budget, start_date: '2015-01-01') #end_date: 2015-01-31
      other_bank = create(:bank_account)
      other_bank_transaction = create(:transaction, transaction_date: '2015-01-12', bank_account_id: other_bank.id)
      transactions = Transaction.for_budget_and_bank(budget.id, @bank_account.id)
      expect(transactions.size).to eq 3
    end

    it 'does not check for null banks if bank_account_id param is null' do
      budget = create(:budget, start_date: '2015-01-01') #end_date: 2015-01-31
      other_bank = create(:bank_account)
      other_bank_transaction = create(:transaction, transaction_date: '2015-01-12', bank_account_id: other_bank.id)
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

  describe "#assign_bank_ref" do
    it "assigns a MAN- prefixed bank_ref when bank_ref is blank on create" do
      transaction = create(:transaction, bank_ref: nil)
      expect(transaction.bank_ref).to start_with("MAN-")
      expect(transaction.bank_ref.length).to eq(20) # "MAN-" (4) + 16 hex chars
    end

    it "does not overwrite a pre-set bank_ref on create" do
      transaction = create(:transaction, bank_ref: "CAMT-abc123")
      expect(transaction.bank_ref).to eq("CAMT-abc123")
    end

    it "assigns a MAN- prefixed bank_ref when bank_ref is an empty string on create" do
      transaction = create(:transaction, bank_ref: "")
      expect(transaction.bank_ref).to start_with("MAN-")
    end
  end

  describe "#net_amount" do
    it "equal to the deposit_amount - withdrawal_amount" do
      transaction = build(:transaction, withdrawal_amount: 50_00, deposit_amount: 60_00)
      expect(transaction.net_amount).to eq 10_00
    end
  end

  describe 'payee_name assignment on create' do
    let(:abn_account) { create(:bank_account, import_format: 'abn-amro-bank') }

    it 'sets payee_name to the cleaned merchant name for a registered format and clean description' do
      txn = create(:transaction, bank_account: abn_account, description: 'ALBERT HEIJN 2242,PAS363')
      expect(txn.payee_name).to eq('ALBERT HEIJN')
    end

    it 'leaves payee_name nil for a transfer description on a registered format' do
      txn = create(:transaction, bank_account: abn_account, description: 'KJ STEPHEN')
      expect(txn.payee_name).to be_nil
    end

    it 'leaves payee_name nil for a blank/unregistered import_format (default factory bank_account)' do
      # Default bank_account factory has import_format: "" — extractor returns nil
      txn = create(:transaction, description: 'ALBERT HEIJN 2242,PAS363')
      expect(txn.payee_name).to be_nil
    end

    it 'preserves an explicitly provided payee_name without overwriting it' do
      txn = create(:transaction, bank_account: abn_account, description: 'ALBERT HEIJN 2242,PAS363',
                   payee_name: 'EXPLICIT')
      expect(txn.payee_name).to eq('EXPLICIT')
    end

    it 'does not change payee_name on update (before_create only)' do
      txn = create(:transaction, bank_account: abn_account, description: 'ALBERT HEIJN 2242,PAS363')
      original_payee = txn.payee_name
      txn.update_columns(payee_name: nil)
      txn.update!(description: 'DIFFERENT DESC')
      expect(txn.reload.payee_name).to be_nil
    end

    it 'clears payee_name on a brought-forward copy of a named transaction' do
      # dup copies payee_name; to_brought_forward_version nils it so the callback
      # re-resolves and PayeeTransferDetector clears the B/F row (no double-count).
      original = create(:transaction, bank_account: abn_account, description: 'ALBERT HEIJN 2242,PAS363')
      expect(original.payee_name).to eq('ALBERT HEIJN')

      bf = original.to_brought_forward_version(Date.new(2026, 4, 1))
      bf.save!
      expect(bf.reload.payee_name).to be_nil
      expect(bf.brought_forward_status).to eq('added')
    end
  end

  describe '#assign_budget_id' do
    let(:bank_account) { create(:bank_account) }
    let!(:budget) { create(:budget, start_date: '2015-01-01') }
    # budget end_date is start_date.next_month.yesterday = 2015-01-31

    it 'assigns budget_id to the budget whose date-range contains transaction_date' do
      txn = create(:transaction, bank_account: bank_account, transaction_date: '2015-01-15')
      expect(txn.budget_id).to eq budget.id
    end

    it 'assigns budget_id when transaction_date equals budget start_date (boundary)' do
      txn = create(:transaction, bank_account: bank_account, transaction_date: '2015-01-01')
      expect(txn.budget_id).to eq budget.id
    end

    it 'assigns budget_id when transaction_date equals budget end_date (boundary)' do
      txn = create(:transaction, bank_account: bank_account, transaction_date: '2015-01-31')
      expect(txn.budget_id).to eq budget.id
    end

    it 'leaves budget_id nil when transaction_date is nil' do
      txn = create(:transaction, bank_account: bank_account, transaction_date: nil)
      expect(txn.budget_id).to be_nil
    end

    it 'leaves budget_id nil when transaction_date falls outside all budgets (in a gap)' do
      txn = create(:transaction, bank_account: bank_account, transaction_date: '2015-03-01')
      expect(txn.budget_id).to be_nil
    end

    it 'reassigns budget_id when transaction_date changes to fall in a different budget' do
      budget2 = create(:budget, start_date: '2015-02-01')
      # budget2 end_date = 2015-02-28

      txn = create(:transaction, bank_account: bank_account, transaction_date: '2015-01-15')
      expect(txn.budget_id).to eq budget.id

      txn.update!(transaction_date: '2015-02-10')
      expect(txn.reload.budget_id).to eq budget2.id
    end

    it 'does not recompute budget_id when a save does not change transaction_date' do
      txn = create(:transaction, bank_account: bank_account, transaction_date: '2015-01-15')
      expect(txn.budget_id).to eq budget.id

      # Forcibly clear it to prove the callback does not run on a non-date save
      txn.update_columns(budget_id: nil)
      txn.update!(status: 'paid')
      expect(txn.reload.budget_id).to be_nil
    end

    context 'brought-forward transactions' do
      let(:next_budget) { create(:budget, start_date: '2015-02-01') }
      # next_budget end_date = 2015-02-28; B/F date = budget.end_date.tomorrow = 2015-02-01

      it 'assigns correct budget_id when brought-forward date falls in an existing next budget' do
        # Simulates the Budget.close path: the next budget exists before close is called
        next_budget # ensure it's created
        original = create(:transaction, bank_account: bank_account, transaction_date: '2015-01-15')
        bf = original.to_brought_forward_version(Date.new(2015, 2, 1))
        bf.save!
        expect(bf.reload.budget_id).to eq next_budget.id
      end

      it 'leaves budget_id nil when brought-forward date has no matching budget yet' do
        # Simulates closing before the next budget is created
        original = create(:transaction, bank_account: bank_account, transaction_date: '2015-01-15')
        bf = original.to_brought_forward_version(Date.new(2015, 2, 1))
        bf.save!
        expect(bf.reload.budget_id).to be_nil
      end
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

    it "clears the bank_ref so a new one is assigned on save" do
      expect(@new_transaction.bank_ref).to be_nil
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
