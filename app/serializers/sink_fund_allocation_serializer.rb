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
#

class SinkFundAllocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :bank_account_id, :comment, :spent, :remaining, :status,
              # new attributes
             :target, :current_balance, :difference

end
