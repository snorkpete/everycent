module Mcp
  # Formats a cents integer into a display-ready currency string.
  # Used by MCP NLQ tool response shaping so the LLM never needs to divide by 100.
  #
  # Format: € symbol + thousands-separated whole part + 2-decimal fraction.
  # Negatives: "-€50.00" (leading minus, then symbol).
  # Nil or 0 → "€0.00".
  #
  # Deliberately integer-based (divmod) — no float arithmetic.
  module Money
    def self.display(cents)
      cents = cents.to_i
      sign   = cents.negative? ? "-" : ""
      whole, frac = cents.abs.divmod(100)
      grouped = whole.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\1,').reverse
      "#{sign}€#{grouped}.#{format('%02d', frac)}"
    end
  end
end
