# == Schema Information
#
# Table name: budgets
#
#  id         :integer          not null, primary key
#  name       :string
#  start_date :date
#  end_date   :date
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

FactoryGirl.define do
  factory :budget do
    start_date "2015-01-02"
  end

end
