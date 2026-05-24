class LlmModelSerializer < ActiveModel::Serializer
  type 'llm_model'

  attributes :id, :provider, :name, :display_name, :url,
             :input_token_cost, :output_token_cost,
             :cache_read_token_cost, :cache_write_token_cost,
             :thinking_token_cost, :active,
             :created_at, :updated_at
end
