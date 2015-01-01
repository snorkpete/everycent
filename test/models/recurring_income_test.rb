# == Schema Information
#
# Table name: recurring_incomes
#
#  id              :integer          not null, primary key
#  name            :string
#  amount          :integer
#  frequency       :string           default("monthly")
#  bank_account_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

require 'test_helper'

class RecurringIncomeTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
