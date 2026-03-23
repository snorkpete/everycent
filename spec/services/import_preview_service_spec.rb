require 'rails_helper'

RSpec.describe ImportPreviewService do
  let(:household) { create(:household) }
  let(:budget) { create(:budget, household: household, start_date: Date.new(2026, 3, 1)) }
  let(:bank_account) do
    ba = create(:bank_account,
      household: household,
      account_no: "NL00ABNA0000000001",
      opening_balance: 50000
    )
    # Update closing fields after create to bypass before_create callback
    ba.update_columns(closing_balance: 50000, closing_date: Date.new(2026, 2, 28))
    ba
  end

  before do
    ActsAsTenant.current_tenant = household
  end

  describe "#call" do
    it "returns enriched bank account data with balance projections" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-15",
              description: "Grocery store",
              withdrawal_amount: 500,
              deposit_amount: 0,
              bank_ref: "REF001",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      expect(result[:bank_accounts].length).to eq(1)
      ba = result[:bank_accounts].first
      expect(ba[:bank_account_id]).to eq(bank_account.id)
      expect(ba[:current_balance]).to eq(50000)
      expect(ba[:net]).to eq(-500)
      expect(ba[:projected_balance]).to eq(49500)
      expect(ba[:transactions].first[:import_status]).to eq("new")
    end
  end

  describe ".validate_iban!" do
    it "raises ValidationError when IBAN does not match account_no" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "DE89370400440532013000",
          transactions: []
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      expect { service.call }.to raise_error(
        ImportPreviewService::ValidationError,
        /IBAN mismatch/
      )
    end

    it "passes when IBAN matches account_no" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: []
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      expect { service.call }.not_to raise_error
    end

    it "passes when both IBAN and account_no are blank" do
      bank_account.update!(account_no: nil)
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "",
          transactions: []
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      expect { service.call }.not_to raise_error
    end
  end

  describe ".validate_transactions!" do
    it "raises ValidationError for invalid dates" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "not-a-date",
              description: "Test",
              withdrawal_amount: 100,
              deposit_amount: 0,
              bank_ref: "REF001",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      expect { service.call }.to raise_error(
        ImportPreviewService::ValidationError,
        /Invalid transaction_date/
      )
    end

    it "raises ValidationError for negative withdrawal_amount" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-15",
              description: "Test",
              withdrawal_amount: -100,
              deposit_amount: 0,
              bank_ref: "REF001",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      expect { service.call }.to raise_error(
        ImportPreviewService::ValidationError,
        /withdrawal_amount must be non-negative/
      )
    end

    it "raises ValidationError for negative deposit_amount" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-15",
              description: "Test",
              withdrawal_amount: 0,
              deposit_amount: -50,
              bank_ref: "REF001",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      expect { service.call }.to raise_error(
        ImportPreviewService::ValidationError,
        /deposit_amount must be non-negative/
      )
    end
  end

  describe ".check_duplicates!" do
    it "marks transactions with existing bank_ref as duplicate" do
      create(:transaction,
        household: household,
        bank_account: bank_account,
        bank_ref: "EXISTING-REF-001",
        transaction_date: Date.new(2026, 3, 10),
        withdrawal_amount: 200,
        deposit_amount: 0
      )

      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-10",
              description: "Duplicate txn",
              withdrawal_amount: 200,
              deposit_amount: 0,
              bank_ref: "EXISTING-REF-001",
              status: "paid"
            ),
            ActionController::Parameters.new(
              transaction_date: "2026-03-15",
              description: "New txn",
              withdrawal_amount: 300,
              deposit_amount: 0,
              bank_ref: "NEW-REF-001",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      transactions = result[:bank_accounts].first[:transactions]
      expect(transactions[0][:import_status]).to eq("duplicate")
      expect(transactions[1][:import_status]).to eq("new")
    end

    it "does not mark transactions with nil bank_ref as duplicate" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-15",
              description: "No ref txn",
              withdrawal_amount: 100,
              deposit_amount: 0,
              bank_ref: nil,
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      expect(result[:bank_accounts].first[:transactions].first[:import_status]).to eq("new")
    end
  end

  describe ".validate_period!" do
    it "marks transactions outside budget period as out_of_period" do
      # Budget is March 2026: 2026-03-01 to 2026-03-31
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-15",
              description: "In period",
              withdrawal_amount: 100,
              deposit_amount: 0,
              bank_ref: "REF-IN",
              status: "paid"
            ),
            ActionController::Parameters.new(
              transaction_date: "2026-02-28",
              description: "Before period",
              withdrawal_amount: 200,
              deposit_amount: 0,
              bank_ref: "REF-BEFORE",
              status: "paid"
            ),
            ActionController::Parameters.new(
              transaction_date: "2026-04-01",
              description: "After period",
              withdrawal_amount: 300,
              deposit_amount: 0,
              bank_ref: "REF-AFTER",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      transactions = result[:bank_accounts].first[:transactions]
      expect(transactions[0][:import_status]).to eq("new")
      expect(transactions[1][:import_status]).to eq("out_of_period")
      expect(transactions[2][:import_status]).to eq("out_of_period")
    end

    it "overrides frontend-sent import_status" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-02-15",
              description: "Frontend said new but is out of period",
              withdrawal_amount: 100,
              deposit_amount: 0,
              bank_ref: "REF-OVERRIDE",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      expect(result[:bank_accounts].first[:transactions].first[:import_status]).to eq("out_of_period")
    end
  end

  describe ".compute_net" do
    it "only sums net amounts of new transactions" do
      create(:transaction,
        household: household,
        bank_account: bank_account,
        bank_ref: "DUP-REF",
        transaction_date: Date.new(2026, 3, 5),
        withdrawal_amount: 100,
        deposit_amount: 0
      )

      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-10",
              description: "New deposit",
              withdrawal_amount: 0,
              deposit_amount: 5000,
              bank_ref: "NEW-DEP",
              status: "paid"
            ),
            ActionController::Parameters.new(
              transaction_date: "2026-03-12",
              description: "New withdrawal",
              withdrawal_amount: 1200,
              deposit_amount: 0,
              bank_ref: "NEW-WD",
              status: "paid"
            ),
            ActionController::Parameters.new(
              transaction_date: "2026-03-05",
              description: "Duplicate",
              withdrawal_amount: 100,
              deposit_amount: 0,
              bank_ref: "DUP-REF",
              status: "paid"
            ),
            ActionController::Parameters.new(
              transaction_date: "2026-02-20",
              description: "Out of period",
              withdrawal_amount: 999,
              deposit_amount: 0,
              bank_ref: "OOP-REF",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      ba = result[:bank_accounts].first
      # net = (5000 - 0) + (0 - 1200) = 3800
      expect(ba[:net]).to eq(3800)
    end
  end

  describe "balance computation" do
    it "computes current_balance from closing_balance + post-closing transactions" do
      # Bank account has closing_balance 50000, closing_date 2026-02-28
      # Add existing transactions after closing date
      create(:transaction,
        household: household,
        bank_account: bank_account,
        bank_ref: "EXIST-1",
        transaction_date: Date.new(2026, 3, 5),
        withdrawal_amount: 1000,
        deposit_amount: 0
      )
      create(:transaction,
        household: household,
        bank_account: bank_account,
        bank_ref: "EXIST-2",
        transaction_date: Date.new(2026, 3, 8),
        withdrawal_amount: 0,
        deposit_amount: 3000
      )

      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-15",
              description: "New txn",
              withdrawal_amount: 500,
              deposit_amount: 0,
              bank_ref: "NEW-1",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      ba = result[:bank_accounts].first
      # current_balance = 50000 + (3000 - 1000) = 52000
      expect(ba[:current_balance]).to eq(52000)
      # net = 0 - 500 = -500
      expect(ba[:net]).to eq(-500)
      # projected = 52000 + (-500) = 51500
      expect(ba[:projected_balance]).to eq(51500)
    end
  end

  describe "multiple bank accounts" do
    it "processes each bank account independently" do
      bank_account2 = create(:bank_account,
        household: household,
        account_no: "NL91INGB0001234567",
        opening_balance: 20000
      )
      bank_account2.update_columns(closing_balance: 20000, closing_date: Date.new(2026, 2, 28))

      params = [
        ActionController::Parameters.new(
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-10",
              description: "Txn 1",
              withdrawal_amount: 100,
              deposit_amount: 0,
              bank_ref: "REF-A1",
              status: "paid"
            )
          ]
        ),
        ActionController::Parameters.new(
          bank_account_id: bank_account2.id,
          iban: "NL91INGB0001234567",
          transactions: [
            ActionController::Parameters.new(
              transaction_date: "2026-03-12",
              description: "Txn 2",
              withdrawal_amount: 0,
              deposit_amount: 2000,
              bank_ref: "REF-B1",
              status: "paid"
            )
          ]
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      result = service.call

      expect(result[:bank_accounts].length).to eq(2)

      ba1 = result[:bank_accounts][0]
      expect(ba1[:bank_account_id]).to eq(bank_account.id)
      expect(ba1[:net]).to eq(-100)

      ba2 = result[:bank_accounts][1]
      expect(ba2[:bank_account_id]).to eq(bank_account2.id)
      expect(ba2[:net]).to eq(2000)
    end
  end

  describe "bank account not found" do
    it "raises ActiveRecord::RecordNotFound for non-existent bank_account_id" do
      params = [
        ActionController::Parameters.new(
          bank_account_id: 999999,
          iban: "NL00ABNA0000000001",
          transactions: []
        )
      ]

      service = ImportPreviewService.new(budget: budget, bank_accounts_params: params)
      expect { service.call }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
