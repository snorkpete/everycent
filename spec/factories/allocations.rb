# == Schema Information
#
# Table name: allocations
#
#  id                     :integer          not null, primary key
#  allocation_class       :string           default("want"), not null
#  allocation_type        :string
#  amount                 :integer
#  comment                :string
#  is_cumulative          :boolean          default(FALSE)
#  is_fixed_amount        :boolean          default(FALSE)
#  is_standing_order      :boolean
#  name                   :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  allocation_category_id :integer
#  bank_account_id        :integer
#  budget_id              :integer
#  household_id           :bigint
#  special_event_id       :bigint
#
# Indexes
#
#  index_allocations_on_allocation_category_id  (allocation_category_id)
#  index_allocations_on_bank_account_id         (bank_account_id)
#  index_allocations_on_budget_id               (budget_id)
#  index_allocations_on_household_id            (household_id)
#  index_allocations_on_name                    (name)
#  index_allocations_on_special_event_id        (special_event_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#  fk_rails_...  (special_event_id => special_events.id)
#

FactoryBot.define do
  factory :allocation do
    household
    allocation_category
    bank_account
    budget
    name {"MyString"}
    amount { 1 }
    allocation_type {"MyString"}
    is_standing_order { 1 }
  end

end
