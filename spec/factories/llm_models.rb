FactoryBot.define do
  factory :llm_model do
    household
    provider { 'anthropic' }
    name { 'claude-sonnet-4-5' }
    display_name { 'Claude Sonnet 4.5' }
    url { 'http://localhost:11434' }
    input_token_cost { 300.0000 }
    output_token_cost { 1500.0000 }
    cache_read_token_cost { 30.0000 }
    cache_write_token_cost { 375.0000 }
    thinking_token_cost { 1500.0000 }
    active { true }
  end
end
