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
class LlmModelSerializer < ActiveModel::Serializer
  type 'llm_model'

  attributes :id, :provider, :name, :display_name, :url,
             :input_token_cost, :output_token_cost,
             :cache_read_token_cost, :cache_write_token_cost,
             :thinking_token_cost, :active,
             :created_at, :updated_at
end
