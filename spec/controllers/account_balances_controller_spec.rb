require 'rails_helper'

describe AccountBalancesController do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe '#index' do
    context 'when not logged in' do
      it 'returns unauthorized' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'loan nesting' do
      before do
        @user = create(:user, household: @household)
        auth_request(@user)

        @asset = create(:bank_account, name: 'My Car', account_category: 'asset')
        @unlinked_loan = create(:bank_account, name: 'Unlinked Loan', account_category: 'liability')
        @linked_loan = create(:bank_account, name: 'Car Loan', account_category: 'liability',
                              asset_bank_account: @asset)
      end

      it 'excludes loans with an asset_bank_account_id from top-level results' do
        get :index
        top_level_ids = assigns(:bank_accounts).map(&:id)
        expect(top_level_ids).not_to include(@linked_loan.id)
      end

      it 'includes unlinked loans at top level' do
        get :index
        top_level_ids = assigns(:bank_accounts).map(&:id)
        expect(top_level_ids).to include(@unlinked_loan.id)
      end

      it 'includes the asset account at top level' do
        get :index
        top_level_ids = assigns(:bank_accounts).map(&:id)
        expect(top_level_ids).to include(@asset.id)
      end

      it 'nests the linked loan under its asset via the loans association' do
        get :index
        asset_in_result = assigns(:bank_accounts).find { |a| a.id == @asset.id }
        expect(asset_in_result.loans.map(&:id)).to include(@linked_loan.id)
      end
    end
  end
end
