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
