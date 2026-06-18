require 'rails_helper'

RSpec.describe PayeeNameResolver do
  let(:household) { create(:household) }

  before do
    ActsAsTenant.current_tenant = household
  end

  # Lightweight stub for the nil-bank_account edge case — the resolver only
  # reads description, brought_forward_status, sink_fund_allocation_id, and
  # bank_account off the transaction.
  PayeeNameResolver::TxnStub ||=
    Struct.new(:description, :brought_forward_status, :sink_fund_allocation_id, :bank_account,
               keyword_init: true)

  describe '.call' do
    context 'transfer description' do
      it 'returns [:cleared, nil] for a surname-vocabulary description' do
        bank_account = create(:bank_account, household: household, import_format: 'abn-amro-bank')
        txn = create(:transaction, household: household, bank_account: bank_account, description: 'KJ STEPHEN')

        outcome, name = described_class.call(txn)
        expect(outcome).to eq(:cleared)
        expect(name).to be_nil
      end
    end

    context 'extractable merchant on a registered format' do
      it 'returns [:named, "ALBERT HEIJN"] for a clean ABN debit-card description' do
        bank_account = create(:bank_account, household: household, import_format: 'abn-amro-bank')
        txn = create(:transaction, household: household, bank_account: bank_account,
                     description: 'ALBERT HEIJN 2242,PAS363')

        outcome, name = described_class.call(txn)
        expect(outcome).to eq(:named)
        expect(name).to eq('ALBERT HEIJN')
      end
    end

    context 'blank/unregistered import_format' do
      it 'returns [:no_extractor, nil] when the bank_account has a blank import_format' do
        bank_account = create(:bank_account, household: household, import_format: '')
        txn = create(:transaction, household: household, bank_account: bank_account,
                     description: 'ALBERT HEIJN 2242,PAS363')

        outcome, name = described_class.call(txn)
        expect(outcome).to eq(:no_extractor)
        expect(name).to be_nil
      end
    end

    context 'nil bank_account (dangling bank_account_id on historical rows)' do
      it 'returns [:no_extractor, nil] — treated the same as an unregistered format' do
        txn = PayeeNameResolver::TxnStub.new(
          description:             'ALBERT HEIJN 2242,PAS363',
          brought_forward_status:  nil,
          sink_fund_allocation_id: nil,
          bank_account:            nil
        )

        outcome, name = described_class.call(txn)
        expect(outcome).to eq(:no_extractor)
        expect(name).to be_nil
      end
    end
  end
end
