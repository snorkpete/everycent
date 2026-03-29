require 'rails_helper'

RSpec.describe ImportTransactionClassifier do
  let(:household) { create(:household) }
  let(:budget) { create(:budget, household: household, start_date: Date.new(2026, 3, 1)) }
  let(:bank_account) do
    ba = create(:bank_account,
      household: household,
      account_no: "NL00ABNA0000000001",
      opening_balance: 50000
    )
    ba.update_columns(closing_balance: 50000, closing_date: Date.new(2026, 2, 28))
    ba
  end

  before do
    ActsAsTenant.current_tenant = household
  end

  def classify(transactions)
    described_class.new(
      budget: budget,
      bank_account: bank_account,
      transactions: transactions
    ).call
  end

  def txn(overrides = {})
    {
      transaction_date: "2026-03-15",
      description: "Test purchase",
      withdrawal_amount: 500,
      deposit_amount: 0,
      bank_ref: "REF-#{SecureRandom.hex(4)}",
      status: "paid"
    }.merge(overrides)
  end

  describe '#call' do
    it 'classifies new in-period transactions as "new"' do
      result = classify([txn])
      expect(result.first[:import_status]).to eq("new")
    end

    it 'classifies duplicate bank_refs as "duplicate"' do
      create(:transaction,
        household: household,
        bank_account: bank_account,
        bank_ref: "EXISTING-REF",
        transaction_date: Date.new(2026, 3, 10),
        withdrawal_amount: 100,
        deposit_amount: 0
      )

      result = classify([txn(bank_ref: "EXISTING-REF")])
      expect(result.first[:import_status]).to eq("duplicate")
    end

    it 'classifies out-of-period transactions as "out_of_period"' do
      result = classify([txn(transaction_date: "2026-01-15")])
      expect(result.first[:import_status]).to eq("out_of_period")
    end

    it 'classifies invalid dates as "invalid_date"' do
      result = classify([txn(transaction_date: "not-a-date")])
      expect(result.first[:import_status]).to eq("invalid_date")
    end

    it 'classifies nil dates as "invalid_date"' do
      result = classify([txn(transaction_date: nil)])
      expect(result.first[:import_status]).to eq("invalid_date")
    end

    it 'classifies user-excluded (deleted) transactions as "user_excluded"' do
      result = classify([txn(deleted: true)])
      expect(result.first[:import_status]).to eq("user_excluded")
    end

    it 'classifies deleted: "true" (string) as "user_excluded"' do
      result = classify([txn(deleted: "true")])
      expect(result.first[:import_status]).to eq("user_excluded")
    end

    it 'classifies negative withdrawal as "invalid_amounts"' do
      result = classify([txn(withdrawal_amount: -100)])
      expect(result.first[:import_status]).to eq("invalid_amounts")
    end

    it 'classifies negative deposit as "invalid_amounts"' do
      result = classify([txn(deposit_amount: -50)])
      expect(result.first[:import_status]).to eq("invalid_amounts")
    end

    it 'classifies both withdrawal and deposit non-zero as "invalid_amounts"' do
      result = classify([txn(withdrawal_amount: 100, deposit_amount: 50)])
      expect(result.first[:import_status]).to eq("invalid_amounts")
    end

    it 'allows both withdrawal and deposit to be zero' do
      result = classify([txn(withdrawal_amount: 0, deposit_amount: 0)])
      expect(result.first[:import_status]).to eq("new")
    end

    it 'does not mark transactions with nil bank_ref as duplicate' do
      result = classify([txn(bank_ref: nil)])
      expect(result.first[:import_status]).to eq("new")
    end

    it 'does not mark transactions with blank bank_ref as duplicate' do
      result = classify([txn(bank_ref: "")])
      expect(result.first[:import_status]).to eq("new")
    end

    it 'classifies multiple transactions independently' do
      create(:transaction,
        household: household,
        bank_account: bank_account,
        bank_ref: "DUP-ONE",
        transaction_date: Date.new(2026, 3, 5),
        withdrawal_amount: 100,
        deposit_amount: 0
      )

      transactions = [
        txn(bank_ref: "BRAND-NEW"),
        txn(bank_ref: "DUP-ONE"),
        txn(bank_ref: "OLD-DATE", transaction_date: "2025-12-01"),
        txn(bank_ref: "BAD-DATE", transaction_date: "nope"),
        txn(bank_ref: "DELETED", deleted: true)
      ]

      result = classify(transactions)
      statuses = result.map { |t| [t[:bank_ref], t[:import_status]] }

      expect(statuses).to contain_exactly(
        ["BRAND-NEW", "new"],
        ["DUP-ONE", "duplicate"],
        ["OLD-DATE", "out_of_period"],
        ["BAD-DATE", "invalid_date"],
        ["DELETED", "user_excluded"]
      )
    end

    context 'classification priority' do
      it 'user_excluded takes precedence over duplicate' do
        create(:transaction,
          household: household,
          bank_account: bank_account,
          bank_ref: "BOTH-DUP-AND-DELETED",
          transaction_date: Date.new(2026, 3, 5),
          withdrawal_amount: 100,
          deposit_amount: 0
        )

        result = classify([txn(bank_ref: "BOTH-DUP-AND-DELETED", deleted: true)])
        expect(result.first[:import_status]).to eq("user_excluded")
      end

      it 'duplicate takes precedence over out_of_period' do
        create(:transaction,
          household: household,
          bank_account: bank_account,
          bank_ref: "DUP-AND-OOP",
          transaction_date: Date.new(2026, 3, 5),
          withdrawal_amount: 100,
          deposit_amount: 0
        )

        result = classify([txn(bank_ref: "DUP-AND-OOP", transaction_date: "2025-01-01")])
        expect(result.first[:import_status]).to eq("duplicate")
      end
    end
  end
end
