# == Schema Information
#

class SinkFundSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_category, :account_no, :institution_id, :opening_balance, :closing_balance, :current_balance, :sub_account_balance, :default_sub_account_amount, :is_sink_fund

  has_one :institution
  has_many :sub_accounts
end
