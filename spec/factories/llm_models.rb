FactoryBot.define do
  factory :llm_model do
    household
    provider { 'anthropic' }
    name { 'claude-sonnet-4-5' }
    display_name { 'Claude Sonnet 4.5' }
    input_token_cost { 3.0000 }
    output_token_cost { 15.0000 }
    cache_read_token_cost { 0.3000 }
    cache_write_token_cost { 3.7500 }
    thinking_token_cost { 15.0000 }
    active { true }
  end
end
