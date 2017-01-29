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

class SinkFundAllocation < ActiveRecord::Base
  belongs_to :bank_account

  has_many :transactions

  validates :name,  presence: true

  def self.build_list_from_params(params)
    params.map do |allocation_params|
      SinkFundAllocation.new(allocation_params)
    end
  end


  def spent
    # TODO: to follow up on why summing in the db causes n+1 queries
    # transactions.sum('withdrawal_amount - deposit_amount')
    #
    # Need to sum in Ruby because summing in the db causes N+1 query issue,
    # and :includes does not resolve it
    transactions.to_a.sum do |transaction|
      transaction.withdrawal_amount - transaction.deposit_amount
    end
  end

  def remaining
    amount - spent
  end

end
