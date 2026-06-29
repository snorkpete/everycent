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
class LlmModel < ApplicationRecord
  # Token cost columns are stored in **cents per million tokens** (decimal, not
  # integer) — LLM pricing is naturally sub-cent per token, so per-record
  # precision below one cent is required. Cost calculation:
  #   total_cost_cents = (tokens * cost_per_mtok_cents) / 1_000_000
  acts_as_tenant :household

  scope :sorted, -> { order(:provider, :name) }

  before_save :strip_url

  validates :provider, presence: true
  validates :name, presence: true
  validates :name, uniqueness: { scope: [:household_id, :provider] }
  validates :url, presence: true

  private

  def strip_url
    self.url = url.strip if url.is_a?(String)
  end
end
