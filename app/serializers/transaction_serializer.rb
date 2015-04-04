# == Schema Information
#
# Table name: transactions
#
#  id                :integer          not null, primary key
#  description       :string
#  bank_ref          :string
#  bank_account_id   :integer
#  transaction_date  :date
#  withdrawal_amount :integer
#  deposit_amount    :integer
#  payee_id          :integer
#  allocation_id     :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class TransactionSerializer < ActiveModel::Serializer
  attributes :id, :description, :bank_ref, :bank_account_id, :transaction_date, :withdrawal_amount, :deposit_amount, :payee_id, :allocation_id

  has_one :allocation
  has_one :bank_account
end
