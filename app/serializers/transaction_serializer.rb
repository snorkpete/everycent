class TransactionSerializer < ActiveModel::Serializer
  attributes :id, :description, :bank_ref, :bank_account_id, :transaction_date, :withdrawal_amount, :deposit_amount, :payee_id, :allocation_id
end
