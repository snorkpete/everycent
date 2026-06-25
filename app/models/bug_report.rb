class BugReport < ApplicationRecord
  acts_as_tenant :household

  belongs_to :reporter, class_name: 'User'

  STATUSES = %w[open in_progress fixed].freeze

  validates :title, presence: true
  validates :description, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :open, -> { where(status: 'open') }
  scope :recent_first, -> { order(created_at: :desc) }

  def reporter_name
    parts = [reporter.first_name, reporter.last_name].compact.reject(&:blank?)
    parts.any? ? parts.join(' ') : reporter.email
  end
end
