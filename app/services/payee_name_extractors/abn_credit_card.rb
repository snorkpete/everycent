module PayeeNameExtractors
  # Cleans `abn-amro-creditcard` / `abn-amro-creditcard-2026` descriptions.
  # Stored shape (importer output): [PREFIX*]MERCHANT CITY COUNTRY
  # where COUNTRY is a trailing ISO code and CITY may be multi-word or a
  # phone/ref number.
  #
  # Examples:
  #   "AUDIBLE NEWARK USA"                       -> "AUDIBLE"
  #   "NETFLIX.COM LOS GATOS USA"                -> "NETFLIX.COM"
  #   "DISNEY PLUS 800-022-1476 NLD"             -> "DISNEY PLUS"
  #   "GOOGLE*GOOGLE PLAY APP G.CO/HELP IRL"     -> "GOOGLE PLAY APP"
  #   "Netflix"                                  -> "Netflix"   (hand-typed)
  #
  # Hand-typed historical names (no CITY/COUNTRY tail, no store code) pass
  # through untouched.
  class AbnCreditCard < Base
    APP_STORE_PREFIX = /\A[A-Z0-9]+\s*\*/i

    def call
      name = description.sub(APP_STORE_PREFIX, "")
      name = strip_personal_annotation(name)
      name = truncate_at_store_code(name)
      name = strip_trailing_noise(name)
      name = collapse_whitespace(name)
      name.empty? ? nil : name
    end
  end
end
