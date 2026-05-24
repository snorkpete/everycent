class LlmModel < ApplicationRecord
  acts_as_tenant :household

  validates :provider, presence: true
  validates :name, presence: true
  validates :name, uniqueness: { scope: [:household_id, :provider] }
end
