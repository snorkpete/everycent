# == Schema Information
#
# Table name: transactions
#
#  id                      :integer          not null, primary key
#  description             :string
#  bank_ref                :string
#  bank_account_id         :integer
#  transaction_date        :date
#  withdrawal_amount       :integer
#  deposit_amount          :integer
#  payee_id                :integer
#  allocation_id           :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  payee_code              :string
#  payee_name              :string
#  sink_fund_allocation_id :integer
#  status                  :string
#  brought_forward_status  :string
#

class TransactionWithoutBankAccountSerializer < ActiveModel::Serializer
  type 'bank_account'

  attributes :id, :description, :bank_ref, :bank_account_id, :transaction_date,
             :withdrawal_amount, :deposit_amount,
             :allocation_id, :sink_fund_allocation_id, :status, :paid, :net_amount,
             :brought_forward_status

  # has_one :allocation
  # has_one :bank_account
  # has_one :sink_fund_allocation
end
