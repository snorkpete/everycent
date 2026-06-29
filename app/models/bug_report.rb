# == Schema Information
#
# Table name: bug_reports
#
#  id           :bigint           not null, primary key
#  description  :text             not null
#  status       :string           default("open"), not null
#  title        :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  household_id :bigint           not null
#  reporter_id  :bigint           not null
#
# Indexes
#
#  index_bug_reports_on_household_id                 (household_id)
#  index_bug_reports_on_household_id_and_created_at  (household_id,created_at)
#  index_bug_reports_on_reporter_id                  (reporter_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#  fk_rails_...  (reporter_id => users.id)
#
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
