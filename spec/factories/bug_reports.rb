FactoryBot.define do
  factory :bug_report do
    household
    association :reporter, factory: :user

    title { 'Something is broken' }
    description { 'When I click the button, nothing happens.' }
    status { 'open' }
  end
end
