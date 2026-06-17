require 'rails_helper'

RSpec.describe PayeeBackfill do
  let(:household) { create(:household) }
  let(:bank_account) do
    create(:bank_account, household: household, import_format: 'abn-amro-bank')
  end

  # PayeeBackfill uses ActsAsTenant.with_tenant internally, but factory_bot
  # associations (e.g. sink_fund_allocation) may read the current tenant during
  # creation; set it here to avoid scoping errors in those factories.
  before do
    ActsAsTenant.current_tenant = household
  end

  # Helper: run in dry_run:false mode by default so most tests can assert DB state.
  def run(dry_run: false)
    described_class.new(household_id: household.id, dry_run: dry_run).call
  end

  def make_txn(overrides = {})
    create(:transaction, { household: household, bank_account: bank_account }.merge(overrides))
  end

  # ------------------------------------------------------------------
  # Structural skip rules (delegated to PayeeTransferDetector)
  # ------------------------------------------------------------------

  describe 'brought_forward_status skip' do
    it 'does not set payee_name and counts as cleared' do
      txn = make_txn(description: 'KFC ALMERE,PAS363', brought_forward_status: 'b/f')

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:cleared]).to eq(1)
      expect(result[:named]).to eq(0)
    end
  end

  describe 'sink_fund_allocation skip' do
    it 'does not set payee_name when sink_fund_allocation_id is present' do
      sink_fund = create(:sink_fund_allocation, bank_account: bank_account)
      txn = make_txn(description: 'KFC ALMERE,PAS363', sink_fund_allocation_id: sink_fund.id)

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:cleared]).to eq(1)
      expect(result[:named]).to eq(0)
    end
  end

  describe 'app-initiated transfer description skip' do
    it 'skips descriptions starting with "Withdrawal - "' do
      txn = make_txn(description: 'Withdrawal - Savings transfer')

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:cleared]).to eq(1)
    end

    it 'skips descriptions starting with "Deposit - "' do
      txn = make_txn(description: 'Deposit - Savings transfer')

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:cleared]).to eq(1)
    end

    it 'skips the exact description "Internal Allocation Transfer"' do
      txn = make_txn(description: 'Internal Allocation Transfer')

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:cleared]).to eq(1)
    end
  end

  # ------------------------------------------------------------------
  # Vocabulary transfer skip (via PayeeTransferDetector delegation)
  # ------------------------------------------------------------------

  describe 'vocabulary transfer skip' do
    it 'counts a surname-vocabulary description as cleared with no payee_name written' do
      # Proves PayeeBackfill delegates vocab transfer detection to the detector,
      # not just structural field checks.
      txn = make_txn(description: 'KJ STEPHEN')

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:cleared]).to eq(1)
      expect(result[:named]).to eq(0)
    end
  end

  # ------------------------------------------------------------------
  # Extraction happy path
  # ------------------------------------------------------------------

  describe 'payee extraction' do
    it 'writes payee_name when the extractor returns a name' do
      txn = make_txn(description: 'ALBERT HEIJN 2242,PAS363')

      result = run
      expect(txn.reload.payee_name).to eq('ALBERT HEIJN')
      expect(result[:named]).to eq(1)
      expect(result[:cleared]).to eq(0)
      expect(result[:no_extractor]).to eq(0)
    end

    it 'extracts payee_name for a transaction with no allocation (most common real-world case)' do
      txn = make_txn(description: 'KFC ALMERE BUITEN,PAS351', allocation_id: nil)

      result = run
      expect(txn.reload.payee_name).to eq('KFC')
      expect(result[:named]).to eq(1)
    end
  end

  # ------------------------------------------------------------------
  # No-extractor path
  # ------------------------------------------------------------------

  describe 'no_extractor path' do
    it 'leaves payee_name nil and counts as no_extractor when import_format is blank' do
      unregistered_account = create(:bank_account, household: household, import_format: '')
      txn = make_txn(description: 'SOME DESCRIPTION', bank_account: unregistered_account)

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:no_extractor]).to eq(1)
    end

    it 'leaves payee_name nil and counts as no_extractor for a genuinely unregistered format' do
      unregistered_account = create(:bank_account, household: household, import_format: 'fc-bank')
      txn = make_txn(description: 'SOME DESCRIPTION', bank_account: unregistered_account)

      result = run
      expect(txn.reload.payee_name).to be_nil
      expect(result[:no_extractor]).to eq(1)
    end
  end

  # ------------------------------------------------------------------
  # Idempotency
  # ------------------------------------------------------------------

  describe 'idempotency' do
    it 'ignores rows that already have a payee_name set' do
      txn = make_txn(description: 'ALBERT HEIJN 2242,PAS363', payee_name: 'EXISTING VALUE')

      result = run
      expect(txn.reload.payee_name).to eq('EXISTING VALUE')
      expect(result[:considered]).to eq(0)
    end
  end

  # ------------------------------------------------------------------
  # Summary hash shape
  # ------------------------------------------------------------------

  describe 'summary hash' do
    it 'returns the expected keys' do
      result = run
      expect(result.keys).to contain_exactly(
        :household_id, :considered, :named, :cleared, :no_extractor
      )
    end

    it 'sets household_id to the given household' do
      expect(run[:household_id]).to eq(household.id)
    end

    it 'considered equals the sum of named + cleared + no_extractor' do
      make_txn(description: 'ALBERT HEIJN 2242,PAS363')          # named
      make_txn(description: 'Withdrawal - transfer')              # cleared
      unregistered = create(:bank_account, household: household, import_format: '')
      make_txn(description: 'FOO', bank_account: unregistered)   # no_extractor

      result = run
      expect(result[:considered]).to eq(
        result[:named] + result[:cleared] + result[:no_extractor]
      )
    end
  end

  # ------------------------------------------------------------------
  # Dry-run mode
  # ------------------------------------------------------------------

  describe 'dry_run mode (default true)' do
    it 'does not persist payee_name when dry_run is true' do
      txn = make_txn(description: 'ALBERT HEIJN 2242,PAS363')

      result = run(dry_run: true)
      expect(txn.reload.payee_name).to be_nil
      expect(result[:named]).to eq(1)
    end

    it 'persists payee_name when dry_run is false' do
      txn = make_txn(description: 'ALBERT HEIJN 2242,PAS363')

      run(dry_run: false)
      expect(txn.reload.payee_name).to eq('ALBERT HEIJN')
    end
  end
end
