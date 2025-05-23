require 'rails_helper'

RSpec.describe TransactionsController, :type => :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe 'authentication' do

    context "when not logged in" do
      it 'has an unauthorized response' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        user = create(:user, household: @household)
        auth_request(user)
      end

      it 'has a response of success' do
        get :index
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe '#index with date filters' do
    before :each do
      user = create(:user)
      auth_request(user)
    end

    it 'gets its list of transactions from Transaction.for_budget_and_bank' do
      #params are always strings
      params = { budget_id: '4', bank_account_id: '10' }
      expect(Transaction).to receive(:for_budget_and_bank).with('4', '10').and_return(Transaction.none)
      get :index, params: params
    end
  end

  describe '#update with transaction data' do
    before :each do
      user = create(:user)
      auth_request(user)

      @transaction_params = [ ]
    end

    # not sure how to test this properly
    xit 'calls Transaction.update_from_params in the update action' do
      params = { transactions: @transaction_params }
      expect(Transaction).to receive(:update_with_params).with(params).and_return(Transaction.none)
      put :update_all, params: params
    end

  end
end
