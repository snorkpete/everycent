# Single source of the payee-name decision for a transaction.
#
# Returns the payee-name decision as [outcome, name]:
#   [:cleared, nil]       — internal transfer / bookkeeping (PayeeTransferDetector says so)
#   [:named, "MERCHANT"]  — a merchant name was extracted
#   [:no_extractor, nil]  — not a transfer, but no name could be extracted
#     (unregistered/blank import_format, blank description, or nothing left after cleaning)
#
# Shared by the Transaction before_create callback (import + manual entry, going
# forward) and the one-shot historical PayeeBackfill, so both apply identical rules.
class PayeeNameResolver
  def self.call(transaction)
    return [:cleared, nil] if PayeeTransferDetector.transfer?(transaction)

    # bank_account is required by the model but a small number of historical rows
    # have a dangling bank_account_id. &.import_format returns nil in that case,
    # which PayeeNameExtractor treats as an unregistered format → :no_extractor.
    name = PayeeNameExtractor.extract(
      description:   transaction.description,
      import_format: transaction.bank_account&.import_format
    )
    name ? [:named, name] : [:no_extractor, nil]
  end
end
