class LlmUsageRecord < ApplicationRecord
  # Append-mostly log of LLM API calls. Token counts in standard units.
  # Cost rates are decimal cents per million tokens, copied from llm_models
  # at write time (point-in-time accounting). total_cost is decimal cents,
  # computed at write time via: (sum of tokens * rate) / 1_000_000.
  USAGE_CATEGORIES = %w[chat query_embedding background_embedding].freeze

  acts_as_tenant :household
  belongs_to :llm_model

  validates :usage_category, presence: true, inclusion: { in: USAGE_CATEGORIES }
  validates :conversation_id, presence: true
  validates :conversation_turn_id, presence: true
  validates :provider, presence: true
  validates :llm_model_name, presence: true

  # Computes total_cost in decimal cents from token counts and cost rates.
  # All rates are cents per million tokens (same convention as llm_models).
  def self.compute_total_cost(input_tokens:, output_tokens:, cache_read_tokens:,
                               cache_write_tokens:, thinking_tokens:,
                               input_token_cost_rate:, output_token_cost_rate:,
                               cache_read_token_cost_rate:, cache_write_token_cost_rate:,
                               thinking_token_cost_rate:)
    (
      input_tokens * input_token_cost_rate +
      output_tokens * output_token_cost_rate +
      cache_read_tokens * cache_read_token_cost_rate +
      cache_write_tokens * cache_write_token_cost_rate +
      thinking_tokens * thinking_token_cost_rate
    ) / BigDecimal("1_000_000")
  end
end
