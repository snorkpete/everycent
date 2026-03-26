require 'rails_helper'

describe BudgetsController do
  render_views false

  let(:household) { create(:household) }
  let(:user) { create(:user, household: household) }
  let(:allocation_category) { create(:allocation_category, household: household) }
  let(:bank_account) { create(:bank_account, household: household, account_type: "normal") }

  let(:previous_budget) { create(:budget, household: household, start_date: "2025-01-01") }
  let(:current_budget) { create(:budget, household: household, start_date: "2025-02-01") }

  before do
    ActsAsTenant.current_tenant = household
  end

  describe "#auto_allocate" do
    context "when not logged in" do
      it "returns unauthorized" do
        post :auto_allocate, params: { id: current_budget.id, descriptions: [] }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before do
        auth_request(user)
      end

      it "returns suggestions for matching descriptions" do
        prev_alloc = create(:allocation,
          household: household,
          budget: previous_budget,
          allocation_category: allocation_category,
          name: "Groceries",
          bank_account: bank_account
        )

        create(:allocation,
          household: household,
          budget: current_budget,
          allocation_category: allocation_category,
          name: "Groceries",
          bank_account: bank_account
        )

        create(:transaction,
          household: household,
          bank_account: bank_account,
          allocation: prev_alloc,
          description: "AH Supermarket",
          transaction_date: "2025-01-15",
          withdrawal_amount: 50,
          deposit_amount: 0
        )

        post :auto_allocate, params: {
          id: current_budget.id,
          descriptions: ["AH Supermarket", "Unknown"]
        }

        expect(response).to be_successful
        body = JSON.parse(response.body)
        expect(body["suggestions"].size).to eq(2)
        expect(body["suggestions"][0]["allocation_name"]).to eq("Groceries")
        expect(body["suggestions"][0]["match_type"]).to eq("exact")
        expect(body["suggestions"][1]).to be_nil
      end

      it "returns empty suggestions when no descriptions provided" do
        post :auto_allocate, params: { id: current_budget.id, descriptions: [] }

        expect(response).to be_successful
        body = JSON.parse(response.body)
        expect(body["suggestions"]).to eq([])
      end
    end
  end
end
