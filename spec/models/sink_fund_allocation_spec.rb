# == Schema Information
#
# Table name: sink_fund_allocations
#
#  id              :integer          not null, primary key
#  name            :string
#  bank_account_id :integer
#  amount          :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  comment         :string
#  status          :string           default("open")
#  household_id    :bigint(8)
#

require 'rails_helper'

RSpec.describe SinkFundAllocation, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
