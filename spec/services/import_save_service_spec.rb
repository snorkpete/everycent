require 'rails_helper'

RSpec.describe ImportSaveService do
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

  def build_service(bank_accounts_params)
    described_class.new(budget: budget, bank_accounts_params: bank_accounts_params)
  end

  def txn_params(overrides = {})
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
    context 'with valid single-account data' do
      it 'creates new transactions' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "NEW-001"), txn_params(bank_ref: "NEW-002", withdrawal_amount: 300)]
        }]

        expect {
          build_service(params).call
        }.to change(Transaction, :count).by(2)
      end

      it 'sets camt_imported to true on created transactions' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "CAMT-001")]
        }]

        build_service(params).call
        txn = Transaction.find_by(bank_ref: "CAMT-001")
        expect(txn.camt_imported).to be true
      end

      it 'preserves the bank_ref from input (does not overwrite with before_create callback)' do
        ref = "ACCT-SVCR-REF-12345"
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: ref)]
        }]

        build_service(params).call
        txn = Transaction.find_by(bank_ref: ref)
        expect(txn).to be_present
        expect(txn.bank_ref).to eq(ref)
      end

      it 'returns correct response shape with balances' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "RESP-001", withdrawal_amount: 1000)]
        }]

        result = build_service(params).call
        ba_result = result[:bank_accounts].first

        expect(ba_result[:bank_account_id]).to eq(bank_account.id)
        expect(ba_result[:current_balance]).to eq(49000) # 50000 - 1000
        expect(ba_result[:net]).to eq(0)
        expect(ba_result[:projected_balance]).to eq(49000)
        expect(ba_result[:transactions].length).to eq(1)
      end

      it 'returns all transactions for the budget period (existing + new)' do
        # Create an existing transaction in the budget period
        create(:transaction,
          household: household,
          bank_account: bank_account,
          bank_ref: "EXISTING-001",
          transaction_date: Date.new(2026, 3, 5),
          withdrawal_amount: 200,
          deposit_amount: 0,
          status: "paid"
        )

        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "NEW-001")]
        }]

        result = build_service(params).call
        ba_result = result[:bank_accounts].first
        expect(ba_result[:transactions].length).to eq(2)
      end

      it 'includes camt_imported in response transactions' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "CAMT-RESP-001")]
        }]

        result = build_service(params).call
        txn = result[:bank_accounts].first[:transactions].first
        expect(txn[:camt_imported]).to be true
      end

      it 'does not include import_status on returned transactions' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "NO-STATUS-001")]
        }]

        result = build_service(params).call
        ba_result = result[:bank_accounts].first
        txn = ba_result[:transactions].first
        expect(txn).not_to have_key(:import_status)
      end
    end

    context 'multi-account save' do
      let(:bank_account2) do
        ba = create(:bank_account,
          household: household,
          account_no: "NL91RABO0315273637",
          opening_balance: 30000
        )
        ba.update_columns(closing_balance: 30000, closing_date: Date.new(2026, 2, 28))
        ba
      end

      it 'creates transactions across multiple accounts' do
        params = [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [txn_params(bank_ref: "MULTI-A1")]
          },
          {
            bank_account_id: bank_account2.id,
            iban: "NL91RABO0315273637",
            transactions: [txn_params(bank_ref: "MULTI-B1"), txn_params(bank_ref: "MULTI-B2")]
          }
        ]

        expect {
          build_service(params).call
        }.to change(Transaction, :count).by(3)
      end

      it 'returns results for all accounts' do
        params = [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [txn_params(bank_ref: "MULTI-A1")]
          },
          {
            bank_account_id: bank_account2.id,
            iban: "NL91RABO0315273637",
            transactions: [txn_params(bank_ref: "MULTI-B1")]
          }
        ]

        result = build_service(params).call
        expect(result[:bank_accounts].length).to eq(2)
        expect(result[:bank_accounts][0][:bank_account_id]).to eq(bank_account.id)
        expect(result[:bank_accounts][1][:bank_account_id]).to eq(bank_account2.id)
      end
    end

    context 'duplicate handling' do
      it 'silently skips transactions with duplicate bank_ref' do
        create(:transaction,
          household: household,
          bank_account: bank_account,
          bank_ref: "DUP-REF",
          transaction_date: Date.new(2026, 3, 10),
          withdrawal_amount: 200,
          deposit_amount: 0
        )

        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [
            txn_params(bank_ref: "DUP-REF"),
            txn_params(bank_ref: "BRAND-NEW")
          ]
        }]

        expect {
          build_service(params).call
        }.to change(Transaction, :count).by(1)

        expect(Transaction.where(bank_ref: "BRAND-NEW").count).to eq(1)
      end

      it 'succeeds when all transactions are duplicates' do
        create(:transaction,
          household: household,
          bank_account: bank_account,
          bank_ref: "ALL-DUP-1",
          transaction_date: Date.new(2026, 3, 10),
          withdrawal_amount: 200,
          deposit_amount: 0
        )

        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "ALL-DUP-1")]
        }]

        expect {
          result = build_service(params).call
          expect(result[:bank_accounts].first[:bank_account_id]).to eq(bank_account.id)
        }.not_to change(Transaction, :count)
      end
    end

    context 'empty input' do
      it 'succeeds with empty bank_accounts array' do
        result = build_service([]).call
        expect(result[:bank_accounts]).to eq([])
      end

      it 'succeeds with empty transactions array' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: []
        }]

        expect {
          result = build_service(params).call
          expect(result[:bank_accounts].first[:current_balance]).to eq(50000)
        }.not_to change(Transaction, :count)
      end
    end

    context 'rollback on failure' do
      let(:bank_account2) do
        ba = create(:bank_account,
          household: household,
          account_no: "NL91RABO0315273637",
          opening_balance: 30000
        )
        ba.update_columns(closing_balance: 30000, closing_date: Date.new(2026, 2, 28))
        ba
      end

      it 'rolls back all accounts if any account fails validation' do
        params = [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [txn_params(bank_ref: "ROLLBACK-A1")]
          },
          {
            bank_account_id: bank_account2.id,
            iban: "WRONG-IBAN",
            transactions: [txn_params(bank_ref: "ROLLBACK-B1")]
          }
        ]

        expect {
          begin
            build_service(params).call
          rescue ImportSaveService::ValidationError
            # expected
          end
        }.not_to change(Transaction, :count)
      end

      it 'silently skips out-of-period transactions without rolling back valid ones' do
        params = [
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [txn_params(bank_ref: "GOOD-ONE")]
          },
          {
            bank_account_id: bank_account.id,
            iban: "NL00ABNA0000000001",
            transactions: [txn_params(bank_ref: "BAD-DATE", transaction_date: "2026-01-01")]
          }
        ]

        expect {
          build_service(params).call
        }.to change(Transaction, :count).by(1)

        expect(Transaction.find_by(bank_ref: "GOOD-ONE")).to be_present
        expect(Transaction.find_by(bank_ref: "BAD-DATE")).to be_nil
      end
    end

    context 'validation errors' do
      it 'raises ValidationError for IBAN mismatch' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "DE89370400440532013000",
          transactions: []
        }]

        expect {
          build_service(params).call
        }.to raise_error(ImportSaveService::ValidationError, /IBAN mismatch/)
      end

      it 'silently skips out-of-period transaction dates' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "OOP-001", transaction_date: "2026-01-15")]
        }]

        expect {
          build_service(params).call
        }.not_to change(Transaction, :count)
      end

      it 'silently skips invalid transaction dates' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "BAD-DATE-001", transaction_date: "not-a-date")]
        }]

        expect {
          build_service(params).call
        }.not_to change(Transaction, :count)
      end

      it 'raises RecordNotFound for non-existent bank account' do
        params = [{
          bank_account_id: 999999,
          iban: "NL00ABNA0000000001",
          transactions: []
        }]

        expect {
          build_service(params).call
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'does not modify existing transactions' do
      it 'leaves existing transactions untouched' do
        existing = create(:transaction,
          household: household,
          bank_account: bank_account,
          bank_ref: "KEEP-ME",
          transaction_date: Date.new(2026, 3, 5),
          withdrawal_amount: 999,
          deposit_amount: 0,
          description: "Original description"
        )

        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "NEW-ADDITION")]
        }]

        build_service(params).call
        existing.reload
        expect(existing.description).to eq("Original description")
        expect(existing.withdrawal_amount).to eq(999)
      end
    end

    context 'field whitelisting' do
      it 'does not allow allocation_id to be set via import' do
        params = [{
          bank_account_id: bank_account.id,
          iban: "NL00ABNA0000000001",
          transactions: [txn_params(bank_ref: "WHITELIST-001").merge(allocation_id: 12345)]
        }]

        build_service(params).call
        txn = Transaction.find_by(bank_ref: "WHITELIST-001")
        expect(txn.allocation_id).to be_nil
      end
    end
  end
end
