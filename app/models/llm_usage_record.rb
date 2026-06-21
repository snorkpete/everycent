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

  scope :recent_first, -> { order(created_at: :desc) }
  scope :on_or_after,  ->(date) { where('created_at >= ?', date.beginning_of_day) }
  scope :on_or_before, ->(date) { where('created_at <= ?', date.end_of_day) }

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

  def self.build_from_model(llm_model, attrs)
    input_tokens        = attrs[:input_tokens].to_i
    output_tokens       = attrs[:output_tokens].to_i
    cache_read_tokens   = attrs[:cache_read_tokens].to_i
    cache_write_tokens  = attrs[:cache_write_tokens].to_i
    thinking_tokens     = attrs[:thinking_tokens].to_i

    total_tokens = input_tokens + output_tokens + cache_read_tokens +
                   cache_write_tokens + thinking_tokens

    total_cost = compute_total_cost(
      input_tokens: input_tokens,
      output_tokens: output_tokens,
      cache_read_tokens: cache_read_tokens,
      cache_write_tokens: cache_write_tokens,
      thinking_tokens: thinking_tokens,
      input_token_cost_rate: llm_model.input_token_cost,
      output_token_cost_rate: llm_model.output_token_cost,
      cache_read_token_cost_rate: llm_model.cache_read_token_cost,
      cache_write_token_cost_rate: llm_model.cache_write_token_cost,
      thinking_token_cost_rate: llm_model.thinking_token_cost
    )

    new(
      llm_model: llm_model,
      usage_category: attrs[:usage_category],
      conversation_id: attrs[:conversation_id],
      conversation_turn_id: attrs[:conversation_turn_id],
      step_index: attrs[:step_index].to_i,
      input_tokens: input_tokens,
      output_tokens: output_tokens,
      cache_read_tokens: cache_read_tokens,
      cache_write_tokens: cache_write_tokens,
      thinking_tokens: thinking_tokens,
      total_tokens: total_tokens,
      input_token_cost_rate: llm_model.input_token_cost,
      output_token_cost_rate: llm_model.output_token_cost,
      cache_read_token_cost_rate: llm_model.cache_read_token_cost,
      cache_write_token_cost_rate: llm_model.cache_write_token_cost,
      thinking_token_cost_rate: llm_model.thinking_token_cost,
      total_cost: total_cost,
      provider: llm_model.provider,
      llm_model_name: llm_model.name,
      request_duration_ms: attrs[:request_duration_ms].to_i,
      incomplete: attrs[:incomplete] || false,
      tool_call_count: attrs[:tool_call_count].to_i,
      tool_calls_detail: attrs[:tool_calls_detail] || [],
      extras: attrs[:extras] || {}
    )
  end

  def self.create_batch!(llm_model:, records:)
    transaction do
      records.map { |attrs| build_from_model(llm_model, attrs).tap(&:save!) }
    end
  end

  def self.summary_for(scope)
    totals = scope.pick(
      Arel.sql('COUNT(*), SUM(total_tokens), SUM(total_cost)')
    )

    by_provider = scope
      .group(:provider)
      .pluck(:provider, Arel.sql('SUM(total_tokens), SUM(total_cost)'))
      .map { |provider, tokens, cost| { provider: provider, total_tokens: tokens.to_i, total_cost: cost.to_d } }

    by_category = scope
      .group(:usage_category)
      .pluck(:usage_category, Arel.sql('SUM(total_tokens), SUM(total_cost)'))
      .map { |category, tokens, cost| { usage_category: category, total_tokens: tokens.to_i, total_cost: cost.to_d } }

    {
      total_records: totals[0].to_i,
      total_tokens: totals[1].to_i,
      total_cost: totals[2].to_d,
      by_provider: by_provider,
      by_category: by_category
    }
  end
end
