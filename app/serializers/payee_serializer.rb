class PayeeSerializer < ActiveModel::Serializer
  attributes :id, :name, :bank_ref, :default_allocation_name, :status
end
