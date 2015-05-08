# == Schema Information
#
# Table name: bank_accounts
#
#  id               :integer          not null, primary key
#  name             :string
#  account_type     :string
#  account_no       :string
#  user_id          :integer
#  institution_id   :integer
#  opening_balance  :integer
#  closing_balance  :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  closing_date     :date
#  account_category :string           default("asset")
#

require 'rails_helper'

RSpec.describe BankAccount, :type => :model do

  context "when saved" do

    let(:bank_account) { BankAccount.create }

    it "has an account_category" do
      expect(bank_account.account_category).to eq 'asset'
    end
  end

  describe ".update_sink_fund" do
    context "with 2 sub account params" do
      before :each do
        @sink_fund = create(:bank_account, is_sink_fund: true, closing_balance: 10_000_00)
        @sink_fund_params = { "sink_fund"=>
                              {"id"=> @sink_fund.id.to_s,
                                "sub_accounts"=>[
                                  {"amount"=>3000_00, "name"=>"First"},
                                  {"amount"=>4000_00, "name"=>"sdon"}
                                 ]
                              }
                            }
      end

      it "creates 2 sub accounts" do
        sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
        expect(sink_fund.sub_accounts.size).to eq 2
      end

      it "removes any old sub accounts" do
        @sink_fund.sub_accounts << SubAccount.new(amount: 100, name: 'will be deleted')
        expect(@sink_fund.sub_accounts.size).to eq 1

        @sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
        expect(@sink_fund.sub_accounts.size).to eq 2
        expect(@sink_fund.sub_accounts[0].name).to eq 'First'
      end

      context "when sub account total is more than account balance" do
        it "does not save" do
          @sink_fund_params["sink_fund"]["sub_accounts"] << { amount: 4000_00, name: 'Too much'}
          sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
          expect(sink_fund).to be_invalid
        end
      end
    end
  end


  describe "#reverse_transactions_from_sub_accounts" do
    before do
      @sink_fund = create(:bank_account, is_sink_fund: true,
                          closing_balance: 4000_00, closing_date: '2014-12-31')
    end

    it "reverses the sub account balances" do
      @sub_account = create(:sub_account, name: 'First', amount: 2000_00)
      @sink_fund.sub_accounts << @sub_account
      transaction = create(:transaction, withdrawal_amount: 500_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @sub_account)
      @sink_fund.reverse_transactions_from_sub_accounts(Transaction.where(id: transaction.id))
      expect(@sink_fund.sub_accounts.first.amount).to eq 2500_00
    end

    it "reverses the sub account balances of multiple sub accounts" do
      @sub_account = create(:sub_account, name: 'First', amount: 2000_00)
      @sink_fund.sub_accounts << @sub_account

      @second_sub_account = create(:sub_account, name: 'Second', amount: 1000_00)
      @sink_fund.sub_accounts << @second_sub_account

      transactions = []
      transactions << create(:transaction, withdrawal_amount: 500_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @sub_account)
      transactions << create(:transaction, withdrawal_amount: 700_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @sub_account)
      transactions << create(:transaction, withdrawal_amount: 100_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @second_sub_account)
      transaction_ids = transactions.map(&:id)
      @sink_fund.reverse_transactions_from_sub_accounts(Transaction.where(id: transaction_ids))
      expect(@sink_fund.sub_accounts.first.amount).to eq 3200_00
      expect(@sink_fund.sub_accounts.second.amount).to eq 1100_00
    end

  end

  describe "#apply_transactions_to_sub_accounts" do
    before do
      @sink_fund = create(:bank_account, is_sink_fund: true,
                          closing_balance: 5000_00, closing_date: '2014-12-31')
    end

    it "updates the sub account balances of multiple sub accounts" do
      @sub_account = create(:sub_account, name: 'First', amount: 3500_00)
      @sink_fund.sub_accounts << @sub_account

      @second_sub_account = create(:sub_account, name: 'Second', amount: 1200_00)
      @sink_fund.sub_accounts << @second_sub_account

      transactions = []
      transactions << create(:transaction, withdrawal_amount: 0, deposit_amount: 400_00,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @sub_account)
      transactions << create(:transaction, withdrawal_amount: 600_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @sub_account)
      transactions << create(:transaction, withdrawal_amount: 900_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sub_account: @second_sub_account)
      transaction_ids = transactions.map(&:id)
      @sink_fund.apply_transactions_to_sub_accounts(Transaction.where(id: transaction_ids))
      expect(@sink_fund.sub_accounts.first.amount).to eq 3300_00
      expect(@sink_fund.sub_accounts.second.amount).to eq 300_00
    end

  end
end
