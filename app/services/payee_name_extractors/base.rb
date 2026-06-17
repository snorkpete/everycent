module PayeeNameExtractors
  # Base for per-format payee-name extractors. Each subclass cleans a stored
  # transaction `description` (the importer's OUTPUT, not raw bank text) into a
  # human-readable merchant name for NLQ embedding.
  #
  # Subclasses implement `#call`, returning a cleaned String or nil when no
  # meaningful merchant name remains.
  #
  # Case is intentionally NOT normalized. Blanket title-casing corrupts acronyms
  # (ABN, NV), legal suffixes (B.V.), domains (.NL) and camelCase brands
  # (McDonalds) to fix only ALL-CAPS variants — a tradeoff embeddings already
  # absorb (they are largely case-insensitive). Revisit only if NLQ quality
  # proves otherwise, and then selectively.
  class Base
    # Trailing tokens to peel off as noise. Derived empirically from hh96 data,
    # where locations are dominated by the home city (Almere + its districts).
    # Matched as a trailing suffix only — never mid-name — and compared
    # punctuation-insensitively (so "B.V." matches "BV").
    LOCATIONS = %w[
      ALMERE ALM AMST AMS AMSTERDAM BUITEN HAVEN STAD OOST OOSTVAARDERS
      HOOFDDORP BENELUX INTERNET
      LOS GATOS SAN FRANCISCO LONDON DUBLIN HAMBURG NEWARK
    ].freeze

    LEGAL_SUFFIXES = %w[BV NV LTD INC SARL SA GMBH VOF BVBA].freeze

    # Trailing ISO country codes on credit-card descriptions (MERCHANT CITY COUNTRY).
    COUNTRY_CODES = %w[USA IRL NLD GBR LUX DEU FRA BEL ESP ITA NL DE GB FR BE].freeze

    NOISE = (LOCATIONS + LEGAL_SUFFIXES + COUNTRY_CODES).to_set.freeze

    HAS_DIGIT = /\d/

    # Household members annotate manual card entries with a trailing cardholder
    # tag "<first-name> Personal", sometimes followed by a free-text note
    # (e.g. "Google Play - Pat Personal", "AMZN DIGITAL Pat Personal Book purchase").
    # Name-specific (Pat|Ki|Kion) so it never eats a surname-only entry like
    # "STEPHEN Personal" (a real transfer), and it consumes the tag plus anything
    # after it so a trailing note doesn't survive into the payee name.
    PERSONAL_ANNOTATION = /\s*-?\s*(?:Pat|Ki|Kion)\s+Personal\b.*\z/i

    def self.call(description)
      new(description).call
    end

    def initialize(description)
      @description = description.to_s
    end

    def call
      raise NotImplementedError, "#{self.class} must implement #call"
    end

    private

    attr_reader :description

    # Collapse runs of whitespace and trim. Shared final-pass normalization.
    def collapse_whitespace(str)
      str.gsub(/\s+/, " ").strip
    end

    # Debit-card descriptions trail the merchant with a store code, phone/ref
    # number and/or city (e.g. "Albert Heijn 8591 ALMERE"). The store code is
    # the first token containing a digit; everything from there on is noise.
    # Truncate there — but never at index 0, so names that themselves begin with
    # a digit-bearing token (e.g. "WWW.F1.COM", "3M") aren't wiped.
    def truncate_at_store_code(str)
      tokens = str.split(" ")
      cut = tokens.each_index.find { |i| i.positive? && tokens[i].match?(HAS_DIGIT) }
      cut ? tokens[0...cut].join(" ") : str
    end

    # Iteratively peel trailing noise tokens (locations, legal suffixes, country
    # codes), trimming stray trailing punctuation between peels. Stops when the
    # last token isn't noise or only one token remains.
    def strip_trailing_noise(str)
      tokens = str.split(" ")
      while tokens.size > 1 && noise_token?(tokens.last)
        tokens.pop
      end
      tokens.join(" ").sub(/[\s,.\-]+\z/, "")
    end

    def noise_token?(token)
      NOISE.include?(token.gsub(/[.,]/, "").upcase)
    end

    def strip_personal_annotation(str)
      str.sub(PERSONAL_ANNOTATION, "")
    end
  end
end
