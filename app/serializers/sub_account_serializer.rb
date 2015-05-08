class SubAccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :amount, :bank_account_id, :comment
end
