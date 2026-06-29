# == Schema Information
#
# Table name: sink_fund_allocations
#
#  id              :integer          not null, primary key
#  amount          :integer
#  comment         :string
#  name            :string
#  status          :string           default("open")
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  bank_account_id :integer
#  household_id    :bigint
#
# Indexes
#
#  index_sink_fund_allocations_on_bank_account_id  (bank_account_id)
#  index_sink_fund_allocations_on_household_id     (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

require 'rails_helper'

RSpec.describe SinkFundAllocation, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
