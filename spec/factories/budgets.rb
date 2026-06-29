# == Schema Information
#
# Table name: budgets
#
#  id           :integer          not null, primary key
#  end_date     :date
#  name         :string
#  start_date   :date
#  status       :string           default("open")
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  household_id :bigint
#
# Indexes
#
#  index_budgets_on_household_id  (household_id)
#  index_budgets_on_start_date    (start_date)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

FactoryBot.define do
  factory :budget do
    household
    start_date {"2015-01-02"}
  end

end
