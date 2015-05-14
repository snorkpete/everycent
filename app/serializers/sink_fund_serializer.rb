# == Schema Information
#

class SinkFundSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_category, :account_no, :institution_id, :opening_balance, :closing_balance, :current_balance, :sink_fund_allocation_balance, :is_sink_fund

  has_one :institution
  has_many :sink_fund_allocations
end
