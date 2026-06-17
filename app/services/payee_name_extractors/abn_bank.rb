module PayeeNameExtractors
  # Cleans `abn-amro-bank` descriptions. Stored shape (importer output):
  #   [CCV*|BCK*|TMC*]MERCHANT [STORE# [CITY]],PASxxx   (debit-card purchases)
  #   MERCHANT [via PROCESSOR]                           (SEPA structured names)
  #
  # Examples:
  #   "Albert Heijn 8591 ALMERE,PAS362"   -> "Albert Heijn"
  #   "KFC ALMERE BUITEN,PAS351"          -> "KFC"
  #   "BURGER KING Almere via Trustly"    -> "BURGER KING"
  #   "HelloFresh Benelux B.V."           -> "HelloFresh"
  #   "SIMPEL NL BV"                       -> "SIMPEL"
  class AbnBank < Base
    # Order matters: PAS suffix sits after the store code, so strip it first.
    PAS_SUFFIX       = /,\s*PAS\d+\s*\z/i
    PROCESSOR_PREFIX = /\A(?:CCV|BCK|TMC)\*/i
    VIA_PROCESSOR    = /\s+via\s+.*\z/i

    def call
      name = description
      name = name.sub(PAS_SUFFIX, "")
      name = name.sub(PROCESSOR_PREFIX, "")
      name = name.sub(VIA_PROCESSOR, "")
      name = strip_personal_annotation(name)
      name = truncate_at_store_code(name)
      name = strip_trailing_noise(name)
      name = collapse_whitespace(name)
      name.empty? ? nil : name
    end
  end
end
