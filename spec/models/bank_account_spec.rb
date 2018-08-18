# == Schema Information
#
# Table name: bank_accounts
#
#  id                         :integer          not null, primary key
#  name                       :string
#  account_type_description   :string
#  account_no                 :string
#  user_id                    :integer
#  institution_id             :integer
#  opening_balance            :integer
#  closing_balance            :integer
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  closing_date               :date
#  account_category           :string           default("asset")
#  allow_default_allocations  :boolean          default(FALSE)
#  default_sub_account_amount :integer          default(0)
#  status                     :string           default("open")
#  account_type               :string           default("normal")
#  statement_day              :integer
#  payment_due_day            :integer
#  is_cash                    :boolean          default(TRUE)
#  import_format              :string           default("")
#  household_id               :bigint(8)
#

require 'rails_helper'

RSpec.describe BankAccount, :type => :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  context "when saved" do

    let(:bank_account) { BankAccount.create }

    it "has an account_category" do
      expect(bank_account.account_category).to eq 'asset'
    end
  end

  context "when created" do

    let(:bank_account) { create(:bank_account, opening_balance: 4000) }

    it "defaults the closing balance to the opening balance" do
      expect(bank_account.closing_balance).to eq(4000)
    end

    it "defaults the closing date to the current date" do
      today = Date.new(2018, 5, 25)
      expect(Date).to receive(:today).and_return today

      expect(bank_account.closing_date).to eq(today)
    end

    it "persists these values properly" do
      today = Date.new(2018, 5, 25)
      expect(Date).to receive(:today).and_return today
      same_bank_account = BankAccount.find(bank_account.id)

      expect(same_bank_account.closing_balance).to eq(4000)
      expect(same_bank_account.closing_date).to eq(today)
    end

  end

  describe "#update_sink_fund" do
    context "with 2 sink_fund_allocation params" do
      before :each do
        @sink_fund = create(:bank_account, account_type: 'sink_fund', closing_balance: 10_000_00)
        @sink_fund_params = HashWithIndifferentAccess.new({ "sink_fund"=>
                              {"id"=> @sink_fund.id.to_s,
                                "sink_fund_allocations"=>[
                                  {"amount"=>3000_00, "name"=>"First"},
                                  {"amount"=>4000_00, "name"=>"sdon"}
                                 ]
                              }
                            })
        @sink_fund_params = ActionController::Parameters.new(@sink_fund_params)
      end

      it "creates 2 sink_fund_allocations" do
        sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
        expect(sink_fund.sink_fund_allocations.size).to eq 2
      end

      it "updates existing sink_fund_allocations" do
        @sink_fund.sink_fund_allocations << SinkFundAllocation.new(amount: 100, name: 'first to update')
        @sink_fund.sink_fund_allocations << SinkFundAllocation.new(amount: 100, name: 'second to update')

        @sink_fund_params[:sink_fund][:sink_fund_allocations] = [
            {id: @sink_fund.sink_fund_allocations[0].id, "amount"=>3000_00, "name"=>"First"},
            {id: @sink_fund.sink_fund_allocations[1].id, "amount"=>4000_00, "name"=>"sdon"}
        ]

        @sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
        expect(@sink_fund.sink_fund_allocations[0].amount).to eq 3000_00
        expect(@sink_fund.sink_fund_allocations[1].amount).to eq 4000_00
      end

      context "when sink_fund_allocation total is more than account balance" do
        it "does not save" do
          pending "validations removed temporarily"
          @sink_fund_params["sink_fund"]["sink_fund_allocations"] << { amount: 4000_00, name: 'Too much'}
          sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
          expect(sink_fund).to be_invalid
        end
      end
    end
  end


  describe "#reverse_transactions_from_sink_fund_allocations" do
    before do
      @sink_fund = create(:bank_account, account_type: 'sink_fund',
                          closing_balance: 4000_00, closing_date: '2014-12-31')
    end

    it "reverses the sink_fund_allocation balances" do
      @sink_fund_allocation = create(:sink_fund_allocation, name: 'First',
                                     amount: 2000_00, bank_account: @sink_fund)
      transaction = create(:transaction, withdrawal_amount: 500_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      @sink_fund.reverse_transactions_from_sink_fund_allocations(Transaction.where(id: transaction.id))
      expect(@sink_fund.sink_fund_allocations.first.amount).to eq 2500_00
    end

    it "reverses the sink_fund_allocation balances of multiple sink_fund_allocations" do
      @sink_fund_allocation = create(:sink_fund_allocation, name: 'First',
                                     amount: 2000_00, bank_account: @sink_fund)

      @second_sink_fund_allocation = create(:sink_fund_allocation, name: 'Second',
                                            amount: 1000_00, bank_account: @sink_fund)

      transactions = []
      transactions << create(:transaction, withdrawal_amount: 500_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 700_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 100_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @second_sink_fund_allocation)
      transaction_ids = transactions.map(&:id)
      @sink_fund.reverse_transactions_from_sink_fund_allocations(Transaction.where(id: transaction_ids))
      expect(@sink_fund.sink_fund_allocations.first.amount).to eq 3200_00
      expect(@sink_fund.sink_fund_allocations.second.amount).to eq 1100_00
    end

  end

  describe "#apply_transactions_to_sink_fund_allocations" do
    before do
      @sink_fund = create(:bank_account, account_type: 'sink_fund',
                          closing_balance: 5000_00, closing_date: '2014-12-31')
    end

    it "updates the sink_fund_allocation balances of multiple sink_fund_allocations" do
      @sink_fund_allocation = create(:sink_fund_allocation, name: 'First',
                                     amount: 3500_00, bank_account: @sink_fund)

      @second_sink_fund_allocation = create(:sink_fund_allocation, name: 'Second',
                                            amount: 1200_00, bank_account: @sink_fund)

      transactions = []
      transactions << create(:transaction, withdrawal_amount: 0, deposit_amount: 400_00,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 600_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 900_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @second_sink_fund_allocation)
      transaction_ids = transactions.map(&:id)
      @sink_fund.apply_transactions_to_sink_fund_allocations(Transaction.where(id: transaction_ids))
      expect(@sink_fund.sink_fund_allocations.first.amount).to eq 3300_00
      expect(@sink_fund.sink_fund_allocations.second.amount).to eq 300_00
    end

  end

  include_examples "CreditCard"

end
