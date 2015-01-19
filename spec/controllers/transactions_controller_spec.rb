require 'rails_helper'

RSpec.describe TransactionsController, :type => :controller do

  describe 'authentication' do

    context "when not logged in" do
      it 'has an unauthorized response' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        user = create(:user)
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

      create(:transaction, transaction_date: '2015-01-10')
      create(:transaction, transaction_date: '2015-01-11')
      create(:transaction, transaction_date: '2015-01-12')
      create(:transaction, transaction_date: '2015-01-13')
    end

    it 'excludes transactions before the start date' do
      get :index, start_date: '2015-01-11', end_date: '2015-01-12'
      expect(assigns(:transactions).size).to eq 2
    end

    it 'excludes transactions after the end date' do
      get :index, start_date: '2015-01-10', end_date: '2015-01-12'
      expect(assigns(:transactions).size).to eq 3
    end
  end

  describe '#update with transaction data' do
    before :each do
      user = create(:user)
      auth_request(user)

      @transaction_params = [ ]
    end

    it 'calls Transaction.update_from_params in the update action' do
      params = { transactions: @transaction_params }
      expect(Transaction).to receive(:update_with_params).with(params)
      post :create, params
    end

  end
end
