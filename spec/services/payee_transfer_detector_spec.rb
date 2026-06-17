require 'rails_helper'

RSpec.describe PayeeTransferDetector do
  # Lightweight stub — the detector only reads three fields off the transaction.
  # Defined under the described class's namespace so it doesn't pollute the
  # top-level constant space (a bare `TxnStub = Struct.new(...)` inside an
  # RSpec describe block would leak as a global constant).
  PayeeTransferDetector::TxnStub ||=
    Struct.new(:description, :brought_forward_status, :sink_fund_allocation_id, keyword_init: true)

  def txn(description: "ALBERT HEIJN 2242,PAS363", brought_forward_status: nil, sink_fund_allocation_id: nil)
    PayeeTransferDetector::TxnStub.new(
      description:             description,
      brought_forward_status:  brought_forward_status,
      sink_fund_allocation_id: sink_fund_allocation_id,
    )
  end

  def transfer?(description: "ALBERT HEIJN 2242,PAS363", **opts)
    described_class.transfer?(txn(description: description, **opts))
  end

  # ------------------------------------------------------------------
  # Step 1 — structural skips
  # ------------------------------------------------------------------

  describe 'structural skips' do
    it 'returns true when brought_forward_status is present' do
      expect(transfer?(brought_forward_status: 'b/f')).to be true
    end

    it 'returns true when sink_fund_allocation_id is present' do
      expect(transfer?(sink_fund_allocation_id: 42)).to be true
    end

    it 'returns true for the exact description "Internal Allocation Transfer"' do
      expect(transfer?(description: 'Internal Allocation Transfer')).to be true
    end

    it 'returns true for descriptions starting with "Withdrawal - "' do
      expect(transfer?(description: 'Withdrawal - Savings transfer')).to be true
    end

    it 'returns true for descriptions starting with "Deposit - "' do
      expect(transfer?(description: 'Deposit - Income')).to be true
    end

    it 'returns false for a blank description (no structural flag set)' do
      expect(transfer?(description: '')).to be false
    end
  end

  # ------------------------------------------------------------------
  # Step 2 — vocabulary (one representative per category)
  # ------------------------------------------------------------------

  describe 'vocabulary matches' do
    it 'returns true for a surname match (KJ STEPHEN)' do
      expect(transfer?(description: 'KJ STEPHEN')).to be true
    end

    it 'returns true for MILLINGTON surname' do
      expect(transfer?(description: 'MILLINGTON TRANSFER')).to be true
    end

    it 'returns true for SINK FUND' do
      expect(transfer?(description: 'SINK FUND TOP-UP')).to be true
    end

    it 'returns true for LTSF abbreviation' do
      expect(transfer?(description: 'LTSF')).to be true
    end

    it 'returns true for EMERGENCY FUND' do
      expect(transfer?(description: 'EMERGENCY FUND CONTRIBUTION')).to be true
    end

    it 'returns true for SF prefix' do
      expect(transfer?(description: 'SF Clothing')).to be true
    end

    it 'returns true for INT CARD SERVI (truncated form)' do
      expect(transfer?(description: 'INT CARD SERVICES')).to be true
    end

    it 'returns true for INTERNATIONAL CARD SERVICES (expanded form)' do
      expect(transfer?(description: 'INTERNATIONAL CARD SERVICES')).to be true
    end

    it 'returns true for description starting with PAYMENT (PAYMENT_PREFIX match)' do
      expect(transfer?(description: 'PAYMENT TO CREDITCARD')).to be true
    end

    it 'returns true for CC PAYMENT' do
      expect(transfer?(description: 'CC PAYMENT REFERENCE')).to be true
    end

    it 'returns true for PAT PERSONAL CHECKING (OWN_ACCOUNT match)' do
      expect(transfer?(description: 'PAT PERSONAL CHECKING')).to be true
    end

    it 'returns true for JOINT ACCOUNT' do
      expect(transfer?(description: 'JOINT ACCOUNT FUNDING')).to be true
    end

    it 'returns true for TRANSFER' do
      expect(transfer?(description: 'TRANSFER TO JOINT ACCOUNT')).to be true
    end

    it 'returns true for TRANSFERRED' do
      expect(transfer?(description: 'TRANSFERRED TO SAVINGS')).to be true
    end
  end

  # ------------------------------------------------------------------
  # Step 2 — broadened / added vocabulary (hh96 dry-run tuning)
  # ------------------------------------------------------------------

  describe 'broadened vocabulary' do
    it 'returns true for EMERGENCY SAVINGS (not just EMERGENCY FUND)' do
      expect(transfer?(description: 'EMERGENCY SAVINGS - LOAN')).to be true
    end

    it 'returns true for EMERGENCY ACCOUNT' do
      expect(transfer?(description: 'EMERGENCY ACCOUNT')).to be true
    end

    it 'returns true for SINK ACCOUNT (not just SINK ACCT)' do
      expect(transfer?(description: 'SINK ACCOUNT - Toward NUON Final')).to be true
    end

    it 'returns true for a bare JOINT reference' do
      expect(transfer?(description: 'Balance from Joint Oct\'18')).to be true
    end

    it 'returns true for AUTO PAYMENT' do
      expect(transfer?(description: 'AUTO PAYMENT')).to be true
    end

    it 'returns true for Auto Credit Payment' do
      expect(transfer?(description: 'Auto Credit Payment')).to be true
    end

    it 'returns true for Credit card payment' do
      expect(transfer?(description: 'Credit card payment')).to be true
    end

    # Debt service is kept as a named expense, not cleared as a transfer — the
    # CC/auto payment patterns are deliberately narrow so these pass through.
    it 'returns false for a mortgage payment' do
      expect(transfer?(description: 'Mortgage payment No7')).to be false
    end

    it 'returns false for a principal payment' do
      expect(transfer?(description: 'Principal payment #12')).to be false
    end

    it 'returns false for an interest payment' do
      expect(transfer?(description: 'Interest payment')).to be false
    end
  end

  # ------------------------------------------------------------------
  # Precision cases — name annotation strip
  # ------------------------------------------------------------------
  # The detector strips "Pat|Ki|Kion Personal" from the END before running
  # vocabulary. This prevents personal-annotation suffixes on real merchant
  # entries from being misclassified as transfers. But it must NOT strip
  # "STEPHEN Personal" (which is a surname-only entry — a real transfer).

  describe 'precision: name annotation strip' do
    it '"Google Play - Pat Personal" → false (annotation stripped, no vocab hit, should be extracted)' do
      expect(transfer?(description: 'Google Play - Pat Personal')).to be false
    end

    it '"WEIGHTWATCHERS ... Pat personal" → false (case-insensitive strip, still no vocab hit)' do
      expect(transfer?(description: 'WEIGHTWATCHERS.COM 866-204-0 Pat personal')).to be false
    end

    it '"PATREON* ... Pat Personal" → false (annotation stripped, PATREON is not a vocab word)' do
      expect(transfer?(description: 'PATREON* MEMBERSHIP Pat Personal')).to be false
    end

    it '"STEPHEN Personal" → true (NAME_ANNOTATION does not match, surname regex fires)' do
      # NAME_ANNOTATION only strips <first_name> Personal; "STEPHEN Personal" has
      # no matching first name, so the string is passed to vocab unchanged and
      # SURNAME matches.
      expect(transfer?(description: 'STEPHEN Personal')).to be true
    end

    it '"PAT PERSONAL CHECKING" → true (lookahead blocks the strip, OWN_ACCOUNT regex fires)' do
      expect(transfer?(description: 'PAT PERSONAL CHECKING')).to be true
    end

    it '"AMZN DIGITAL Pat Personal Book purchase" → false (mid-string note stripped, real merchant)' do
      expect(transfer?(description: 'AMZN DIGITAL Pat Personal Book purchase')).to be false
    end

    it '"Morphe London - Pat Personal makeup brush" → false (mid-string note stripped, real merchant)' do
      expect(transfer?(description: 'Morphe London - Pat Personal makeup brush')).to be false
    end

    it '"PAT PERSONAL game" → false (leading note, no own-account word; strips to empty)' do
      # No merchant precedes the tag, so nothing remains after the strip and no
      # vocab matches. PayeeBackfill leaves it NULL via the extractor (no name).
      expect(transfer?(description: 'PAT PERSONAL game')).to be false
    end

    it '"Ki Personal" trailing annotation alone → false (after strip nothing remains to match)' do
      # Edge: entire description is just the annotation. After strip → ""; vocab
      # finds no match → false (no extractor will find a name either, but that
      # is PayeeBackfill's concern).
      expect(transfer?(description: 'Ki Personal')).to be false
    end
  end

  # ------------------------------------------------------------------
  # Plain merchant → false
  # ------------------------------------------------------------------

  describe 'plain merchants' do
    it 'returns false for a regular debit-card purchase' do
      expect(transfer?(description: 'ALBERT HEIJN 2242,PAS363')).to be false
    end

    it 'returns false for a credit-card purchase with country code' do
      expect(transfer?(description: 'AUDIBLE NEWARK USA')).to be false
    end

    it 'returns false for a SEPA name' do
      expect(transfer?(description: 'HelloFresh Benelux B.V.')).to be false
    end
  end
end
