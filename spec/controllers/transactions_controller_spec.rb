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

  describe '#import_preview' do
    let(:budget) { create(:budget, household: @household, start_date: Date.new(2026, 3, 1)) }
    let(:bank_account) do
      ba = create(:bank_account,
        household: @household,
        account_no: "NL00ABNA0000000001",
        opening_balance: 50000
      )
      ba.update_columns(closing_balance: 50000, closing_date: Date.new(2026, 2, 28))
      ba
    end

    before :each do
      @user = create(:user, household: @household)
      auth_request(@user)
    end

    it 'returns success with valid data' do
      post :import_preview, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [
              {
                transaction_date: "2026-03-15",
                description: "Test txn",
                withdrawal_amount: 500,
                deposit_amount: 0,
                bank_ref: "REF001",
                status: "paid"
              }
            ]
          }
        ]
      }

      expect(response).to have_http_status(:success)
      body = JSON.parse(response.body)
      expect(body["bank_accounts"].length).to eq(1)
      ba = body["bank_accounts"].first
      expect(ba["bank_account_id"]).to eq(bank_account.id)
      expect(ba["current_balance"]).to eq(50000)
      expect(ba["net"]).to eq(-500)
      expect(ba["projected_balance"]).to eq(49500)
      expect(ba["transactions"].first["import_status"]).to eq("new")
    end

    it 'returns 404 for non-existent budget' do
      post :import_preview, params: {
        budget_id: 999999,
        bank_accounts: []
      }

      expect(response).to have_http_status(:not_found)
    end

    it 'returns 404 for non-existent bank account' do
      post :import_preview, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: 999999,
            iban: "NL00ABNA0000000001",
            transactions: []
          }
        ]
      }

      expect(response).to have_http_status(:not_found)
    end

    it 'returns 422 for IBAN mismatch' do
      post :import_preview, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: bank_account.id,
            iban: "DE89370400440532013000",
            transactions: []
          }
        ]
      }

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error"]).to match(/IBAN mismatch/)
    end

    it 'marks duplicate transactions correctly' do
      create(:transaction,
        household: @household,
        bank_account: bank_account,
        bank_ref: "EXISTING-REF",
        transaction_date: Date.new(2026, 3, 10),
        withdrawal_amount: 200,
        deposit_amount: 0
      )

      post :import_preview, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [
              {
                transaction_date: "2026-03-10",
                description: "Duplicate",
                withdrawal_amount: 200,
                deposit_amount: 0,
                bank_ref: "EXISTING-REF",
                status: "paid"
              },
              {
                transaction_date: "2026-03-15",
                description: "New one",
                withdrawal_amount: 300,
                deposit_amount: 0,
                bank_ref: "BRAND-NEW",
                status: "paid"
              }
            ]
          }
        ]
      }

      expect(response).to have_http_status(:success)
      body = JSON.parse(response.body)
      txns = body["bank_accounts"].first["transactions"]
      expect(txns[0]["import_status"]).to eq("duplicate")
      expect(txns[1]["import_status"]).to eq("new")
    end

    it 'marks out-of-period transactions correctly' do
      post :import_preview, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [
              {
                transaction_date: "2026-02-15",
                description: "Before period",
                withdrawal_amount: 100,
                deposit_amount: 0,
                bank_ref: "REF-BEFORE",
                status: "paid"
              },
              {
                transaction_date: "2026-03-15",
                description: "In period",
                withdrawal_amount: 100,
                deposit_amount: 0,
                bank_ref: "REF-IN",
                status: "paid"
              }
            ]
          }
        ]
      }

      expect(response).to have_http_status(:success)
      body = JSON.parse(response.body)
      txns = body["bank_accounts"].first["transactions"]
      expect(txns[0]["import_status"]).to eq("out_of_period")
      expect(txns[1]["import_status"]).to eq("new")
    end

    it 'requires authentication' do
      # Clear auth headers to simulate unauthenticated request
      request.headers.merge!({
        'access-token' => '',
        'token-type' => '',
        'client' => '',
        'uid' => ''
      })
      sign_out @user

      post :import_preview, params: {
        budget_id: budget.id,
        bank_accounts: []
      }

      expect(response).to have_http_status(:unauthorized)
    end

    context 'tenant scoping' do
      it 'cannot access a budget from another household' do
        other_household = create(:household, name: "Other Household")
        other_budget = nil
        ActsAsTenant.with_tenant(other_household) do
          other_budget = create(:budget, household: other_household, start_date: Date.new(2026, 3, 1))
        end

        post :import_preview, params: {
          budget_id: other_budget.id,
          bank_accounts: []
        }

        expect(response).to have_http_status(:not_found)
      end

      it 'cannot access a bank account from another household' do
        other_household = create(:household, name: "Other Household")
        other_bank_account = nil
        ActsAsTenant.with_tenant(other_household) do
          other_bank_account = create(:bank_account,
            household: other_household,
            account_no: "NL00ABNA0000000001"
          )
        end

        post :import_preview, params: {
          budget_id: budget.id,
          bank_accounts: [
            {
              bank_account_id: other_bank_account.id,
              iban: "NL00ABNA0000000001",
              transactions: []
            }
          ]
        }

        expect(response).to have_http_status(:not_found)
      end
    end

    it 'does not save any transactions to the database' do
      expect {
        post :import_preview, params: {
          budget_id: budget.id,
          bank_accounts: [
            {
              bank_account_id: bank_account.id,
              iban: "NL00ABNA0000000001",
              transactions: [
                {
                  transaction_date: "2026-03-15",
                  description: "Should not be saved",
                  withdrawal_amount: 500,
                  deposit_amount: 0,
                  bank_ref: "NO-SAVE",
                  status: "paid"
                }
              ]
            }
          ]
        }
      }.not_to change(Transaction, :count)
    end
  end

  describe '#import_save' do
    let(:budget) { create(:budget, household: @household, start_date: Date.new(2026, 3, 1)) }
    let(:bank_account) do
      ba = create(:bank_account,
        household: @household,
        account_no: "NL00ABNA0000000001",
        opening_balance: 50000
      )
      ba.update_columns(closing_balance: 50000, closing_date: Date.new(2026, 2, 28))
      ba
    end

    before :each do
      @user = create(:user, household: @household)
      auth_request(@user)
    end

    it 'returns success and creates transactions' do
      expect {
        post :import_save, params: {
          budget_id: budget.id,
          bank_accounts: [
            {
              bank_account_id: bank_account.id,
              iban: "NL00ABNA0000000001",
              transactions: [
                {
                  transaction_date: "2026-03-15",
                  description: "Albert Heijn",
                  withdrawal_amount: 500,
                  deposit_amount: 0,
                  bank_ref: "SAVE-001",
                  status: "paid"
                }
              ]
            }
          ]
        }
      }.to change(Transaction, :count).by(1)

      expect(response).to have_http_status(:success)
      body = JSON.parse(response.body)
      ba = body["bank_accounts"].first
      expect(ba["bank_account_id"]).to eq(bank_account.id)
      expect(ba["current_balance"]).to eq(49500)
      expect(ba["net"]).to eq(0)
      expect(ba["projected_balance"]).to eq(49500)
      expect(ba["transactions"].length).to eq(1)
    end

    it 'silently skips duplicate bank_ref transactions' do
      create(:transaction,
        household: @household,
        bank_account: bank_account,
        bank_ref: "EXISTING-REF",
        transaction_date: Date.new(2026, 3, 10),
        withdrawal_amount: 200,
        deposit_amount: 0
      )

      expect {
        post :import_save, params: {
          budget_id: budget.id,
          bank_accounts: [
            {
              bank_account_id: bank_account.id,
              iban: "NL00ABNA0000000001",
              transactions: [
                {
                  transaction_date: "2026-03-10",
                  description: "Duplicate",
                  withdrawal_amount: 200,
                  deposit_amount: 0,
                  bank_ref: "EXISTING-REF",
                  status: "paid"
                },
                {
                  transaction_date: "2026-03-15",
                  description: "New one",
                  withdrawal_amount: 300,
                  deposit_amount: 0,
                  bank_ref: "BRAND-NEW",
                  status: "paid"
                }
              ]
            }
          ]
        }
      }.to change(Transaction, :count).by(1)

      expect(response).to have_http_status(:success)
    end

    it 'returns 422 for IBAN mismatch' do
      post :import_save, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: bank_account.id,
            iban: "DE89370400440532013000",
            transactions: []
          }
        ]
      }

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error"]).to match(/IBAN mismatch/)
    end

    it 'returns 422 for out-of-period transaction date' do
      post :import_save, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [
              {
                transaction_date: "2026-01-15",
                description: "Out of period",
                withdrawal_amount: 100,
                deposit_amount: 0,
                bank_ref: "OOP-001",
                status: "paid"
              }
            ]
          }
        ]
      }

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body["error"]).to match(/outside budget period/)
    end

    it 'returns 404 for non-existent budget' do
      post :import_save, params: {
        budget_id: 999999,
        bank_accounts: []
      }

      expect(response).to have_http_status(:not_found)
    end

    it 'returns 404 for non-existent bank account' do
      post :import_save, params: {
        budget_id: budget.id,
        bank_accounts: [
          {
            bank_account_id: 999999,
            iban: "NL00ABNA0000000001",
            transactions: []
          }
        ]
      }

      expect(response).to have_http_status(:not_found)
    end

    it 'requires authentication' do
      request.headers.merge!({
        'access-token' => '',
        'token-type' => '',
        'client' => '',
        'uid' => ''
      })
      sign_out @user

      post :import_save, params: {
        budget_id: budget.id,
        bank_accounts: []
      }

      expect(response).to have_http_status(:unauthorized)
    end

    it 'succeeds with empty bank_accounts array' do
      post :import_save, params: {
        budget_id: budget.id,
        bank_accounts: []
      }

      expect(response).to have_http_status(:success)
      body = JSON.parse(response.body)
      expect(body["bank_accounts"]).to eq([])
    end

    context 'tenant scoping' do
      it 'cannot access a budget from another household' do
        other_household = create(:household, name: "Other Household")
        other_budget = nil
        ActsAsTenant.with_tenant(other_household) do
          other_budget = create(:budget, household: other_household, start_date: Date.new(2026, 3, 1))
        end

        post :import_save, params: {
          budget_id: other_budget.id,
          bank_accounts: []
        }

        expect(response).to have_http_status(:not_found)
      end

      it 'cannot access a bank account from another household' do
        other_household = create(:household, name: "Other Household")
        other_bank_account = nil
        ActsAsTenant.with_tenant(other_household) do
          other_bank_account = create(:bank_account,
            household: other_household,
            account_no: "NL00ABNA0000000001"
          )
        end

        post :import_save, params: {
          budget_id: budget.id,
          bank_accounts: [
            {
              bank_account_id: other_bank_account.id,
              iban: "NL00ABNA0000000001",
              transactions: []
            }
          ]
        }

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'multi-account save' do
      let(:bank_account2) do
        ba = create(:bank_account,
          household: @household,
          account_no: "NL91RABO0315273637",
          opening_balance: 30000
        )
        ba.update_columns(closing_balance: 30000, closing_date: Date.new(2026, 2, 28))
        ba
      end

      it 'creates transactions across multiple accounts atomically' do
        expect {
          post :import_save, params: {
            budget_id: budget.id,
            bank_accounts: [
              {
                bank_account_id: bank_account.id,
                iban: "NL00ABNA0000000001",
                transactions: [
                  {
                    transaction_date: "2026-03-15",
                    description: "Account 1 txn",
                    withdrawal_amount: 500,
                    deposit_amount: 0,
                    bank_ref: "MULTI-A1",
                    status: "paid"
                  }
                ]
              },
              {
                bank_account_id: bank_account2.id,
                iban: "NL91RABO0315273637",
                transactions: [
                  {
                    transaction_date: "2026-03-16",
                    description: "Account 2 txn",
                    withdrawal_amount: 300,
                    deposit_amount: 0,
                    bank_ref: "MULTI-B1",
                    status: "paid"
                  }
                ]
              }
            ]
          }
        }.to change(Transaction, :count).by(2)

        expect(response).to have_http_status(:success)
        body = JSON.parse(response.body)
        expect(body["bank_accounts"].length).to eq(2)
      end
    end
  end
end
