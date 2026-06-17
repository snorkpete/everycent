# Cleans a stored transaction `description` into a human-readable merchant
# `payee_name` for NLQ embedding, routed by the bank account's `import_format`.
#
# Mirrors the dispatch shape of the frontend `transactionImporter.ts`: a registry
# keyed by import_format, with unregistered formats falling through to a no-op
# (nil) — the importer's `default` branch. Each registered extractor is a small
# per-format class under PayeeNameExtractors.
#
# This is pure description cleaning. It does NOT decide whether a row *should*
# get a payee — internal-transfer null-out (structural: brought_forward_status,
# sink_fund_allocation_id, budget_role) is the caller's responsibility.
class PayeeNameExtractor
  REGISTRY = {
    "abn-amro-bank"            => PayeeNameExtractors::AbnBank,
    "abn-amro-creditcard"      => PayeeNameExtractors::AbnCreditCard,
    "abn-amro-creditcard-2026" => PayeeNameExtractors::AbnCreditCard,
  }.freeze

  # Returns a cleaned payee name String, or nil when the format is unregistered
  # or no meaningful merchant name remains.
  def self.extract(description:, import_format:)
    extractor = REGISTRY[import_format]
    return nil if extractor.nil? || description.blank?

    extractor.call(description)
  end
end
