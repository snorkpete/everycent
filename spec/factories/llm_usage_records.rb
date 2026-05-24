FactoryBot.define do
  factory :llm_usage_record do
    household
    llm_model

    usage_category { 'chat' }
    conversation_id { SecureRandom.uuid }
    conversation_turn_id { SecureRandom.uuid }

    input_tokens { 1200 }
    output_tokens { 350 }
    cache_read_tokens { 0 }
    cache_write_tokens { 0 }
    thinking_tokens { 0 }
    total_tokens { 1550 }

    # Rates match the default llm_model factory (anthropic/claude-sonnet-4-5)
    input_token_cost_rate { 300.0000 }
    output_token_cost_rate { 1500.0000 }
    cache_read_token_cost_rate { 30.0000 }
    cache_write_token_cost_rate { 375.0000 }
    thinking_token_cost_rate { 1500.0000 }

    # (1200 * 300 + 350 * 1500) / 1_000_000 = (360_000 + 525_000) / 1_000_000 = 0.885
    total_cost { 0.8850 }

    provider { 'anthropic' }
    llm_model_name { 'claude-sonnet-4-5' }

    request_duration_ms { 4200 }
    incomplete { false }
    tool_call_count { 0 }
    tool_calls_detail { [] }
    extras { {} }
  end
end
