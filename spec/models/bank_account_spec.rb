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
end
