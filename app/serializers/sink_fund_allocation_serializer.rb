class SinkFundAllocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :bank_account_id, :comment, :spent, :remaining
end
