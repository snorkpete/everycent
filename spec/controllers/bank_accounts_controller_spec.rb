require 'rails_helper'

describe BankAccountsController do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe "transfer" do
    before :each do
      @user = create(:user, household: @household)
      auth_request(@user)

      @from_account = create(:bank_account)
      @to_account = create(:bank_account)

      @params = {
          from_account_id: @from_account.id,
          to_account_id: @to_account.id,
          amount: 400,
          date: '2018-10-01',
          description: 'my transfer'
      }
    end

    it "calls #transfer on the 'to' account" do
      pending "not working - transfer not being found on controller"
      expect(@from_account.transactions.length).to eq 0
      post :transfer, params: @params
      expect(@from_account.transactions.length).to eq 1
    end
  end

  describe "#copy" do
    it "calls Budget.copy with the id" do
      pending "not working - Budget.copy not being called"
      expect(Budget).to receive(:copy)
      put :copy, id: 5
    end

    it "returns the results of Budget.copy" do
    end

  end
end
