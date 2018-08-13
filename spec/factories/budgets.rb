# == Schema Information
#
# Table name: budgets
#
#  id           :integer          not null, primary key
#  name         :string
#  start_date   :date
#  end_date     :date
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  status       :string           default("open")
#  household_id :bigint(8)
#

FactoryBot.define do
  factory :budget do
    household
    start_date "2015-01-02"
  end

end
