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
FactoryBot.define do
  factory :bug_report do
    household
    association :reporter, factory: :user

    title { 'Something is broken' }
    description { 'When I click the button, nothing happens.' }
    status { 'open' }
  end
end
