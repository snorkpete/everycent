# == Schema Information
#
# Table name: llm_models
#
#  id                     :bigint           not null, primary key
#  active                 :boolean          default(TRUE), not null
#  cache_read_token_cost  :decimal(10, 4)   default(0.0), not null
#  cache_write_token_cost :decimal(10, 4)   default(0.0), not null
#  display_name           :string
#  input_token_cost       :decimal(10, 4)   default(0.0), not null
#  name                   :string           not null
#  output_token_cost      :decimal(10, 4)   default(0.0), not null
#  provider               :string           not null
#  thinking_token_cost    :decimal(10, 4)   default(0.0), not null
#  url                    :string           not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  household_id           :bigint           not null
#
# Indexes
#
#  index_llm_models_on_household_id                        (household_id)
#  index_llm_models_on_household_id_and_provider_and_name  (household_id,provider,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#
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
