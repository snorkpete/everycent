require 'rails_helper'

describe DefaultAllocationsController do

  before do
    @user = create(:user)
    auth_request(@user)
    @budget = create(:budget)
  end

  describe '#retrieve' do
    it "allows post requests to index" do
      params = { budget_id: @budget.id.to_s, transactions: [] }
      expect(Payee).to receive(:default_allocations).with(params[:budget_id], nil).and_return []
      post :retrieve, params: params
      expect(response).to have_http_status :success
    end

    it "calls Payee.default_allocations" do
      params = { budget_id: @budget.id.to_s, transactions: [{ 'code'=>'200' }, { 'code'=>'400' }] }
      expect(Payee).to receive(:default_allocations).with(params[:budget_id], params[:transactions]).and_return []
      post :retrieve, params: params
    end
  end

end
