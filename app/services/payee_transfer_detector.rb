# Decides whether a transaction is an internal transfer / bookkeeping movement
# that must be left with payee_name NULL (cleared, not extracted).
#
# Decision order — short-circuits on first match:
#   1. Structural fields (brought_forward_status, sink_fund_allocation_id)
#   2. App-initiated transfer descriptions (exact or prefix)
#   3. Vocabulary regexes against the description (hh96-specific)
#
# PRECISION TRAP — name-specific annotation strip:
#   Household members annotate manual card entries with a trailing cardholder
#   tag "<first-name> Personal", sometimes followed by a free-text note
#   (e.g. "Google Play - Pat Personal", "AMZN DIGITAL Pat Personal Book purchase").
#   Before running vocabulary regexes we strip that tag (and any trailing note)
#   so a real merchant isn't misread as an own-account transfer.
#
#   NAME_ANNOTATION is name-specific (Pat|Ki|Kion) so it never eats a surname-only
#   entry like "STEPHEN Personal" (a real transfer). It carries a negative
#   lookahead so it does NOT strip when "Personal" is naming an own account
#   (CC/ACCT/ACCOUNT/CHECKING) — those must survive for OWN_ACCOUNT to clear them.
#   (Base::PERSONAL_ANNOTATION is the extractor's cousin: same name-specific tag,
#   but greedy with no lookahead, since rows that reach the extractor are never
#   own-account references — those are cleared here first.)
#
#   Concretely:
#     "Google Play - Pat Personal"            → strips → "Google Play" → no vocab → false (extract)
#     "AMZN DIGITAL Pat Personal Book purchase"→ strips → "AMZN DIGITAL" → no vocab → false (extract)
#     "STEPHEN Personal"                      → no NAME_ANNOTATION match → surname hit → true (clear)
#     "PAT PERSONAL CHECKING"                 → lookahead blocks strip → own-account → true (clear)
class PayeeTransferDetector
  # Name-specific cardholder tag (Pat|Ki|Kion Personal + any trailing note).
  # The negative lookahead spares own-account names ("Pat Personal CHECKING")
  # so OWN_ACCOUNT can still classify them as transfers.
  NAME_ANNOTATION = /\s*-?\s*(?:Pat|Ki|Kion)\s+Personal\b(?!\s+(?:CC|ACCT|ACCOUNT|CHECKING)\b).*\z/i

  SURNAME             = /\b(?:STEPHEN|MILLINGTON)\b/i
  SINK_FUND           = /\bSINK\s*(?:FUND|ACCT|ACCOUNT|SAVINGS)\b/i
  LONG_TERM_SF        = /\b(?:LTSF|LONG TERM SINK)\b/i
  EMERGENCY           = /\bEMERGENCY\s+(?:FUND|SAVINGS|ACCT|ACCOUNT)\b/i
  SF_PREFIX           = /\ASF\s/i
  CC_PAYMENT_INTL     = /\bINT(?:ERNATIONAL)? CARD SERVI/i
  PAYMENT_PREFIX      = /\APAYMENT\b/i
  CC_PAYMENT          = /\bCC PAYMENT\b/i
  AUTO_PAYMENT        = /\bAUTO\s+(?:CREDIT\s+)?PAYMENT\b/i
  CREDIT_CARD_PAYMENT = /\bCREDIT\s*CARD\s+PAYMENT\b/i
  OWN_ACCOUNT         = /\b(?:JOINT|PERSONAL (?:CHECKING|CC|ACCT|ACCOUNT))\b/i
  TRANSFER            = /\bTRANSFER(?:RED)?\b/i

  APP_TRANSFER_EXACT    = "Internal Allocation Transfer"
  APP_TRANSFER_PREFIXES = ["Withdrawal - ", "Deposit - "].freeze

  VOCAB_PATTERNS = [
    SURNAME, SINK_FUND, LONG_TERM_SF, EMERGENCY, SF_PREFIX,
    CC_PAYMENT_INTL, PAYMENT_PREFIX, CC_PAYMENT, AUTO_PAYMENT, CREDIT_CARD_PAYMENT,
    OWN_ACCOUNT, TRANSFER,
  ].freeze

  # Returns true when the transaction is an internal transfer / bookkeeping row
  # that should be left with payee_name NULL. Returns false when extraction should proceed.
  def self.transfer?(transaction)
    new(transaction).transfer?
  end

  def initialize(transaction)
    @transaction = transaction
  end

  def transfer?
    # Step 1 — structural exact skips
    return true if @transaction.brought_forward_status.present?
    return true if @transaction.sink_fund_allocation_id.present?

    desc = @transaction.description.to_s
    return true if app_initiated_transfer?(desc)

    # Step 2 — vocabulary (strip name annotation first — see precision trap above)
    stripped = desc.sub(NAME_ANNOTATION, "")
    return true if VOCAB_PATTERNS.any? { |pattern| stripped.match?(pattern) }

    # Step 3 — not a transfer
    false
  end

  private

  def app_initiated_transfer?(desc)
    return false if desc.blank?
    return true  if desc == APP_TRANSFER_EXACT
    APP_TRANSFER_PREFIXES.any? { |prefix| desc.start_with?(prefix) }
  end
end
