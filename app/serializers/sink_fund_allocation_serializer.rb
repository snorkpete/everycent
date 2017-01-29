class SinkFundAllocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :bank_account_id, :comment, :spent, :remaining, :status,
              # new attributes
             :target, :current_balance, :difference

end
