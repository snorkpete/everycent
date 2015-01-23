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

class Transaction < ActiveRecord::Base

  belongs_to :allocation
  belongs_to :bank_account

  def self.for_budget_and_bank(budget_id, bank_account_id)

    # find the budget
    budget = Budget.find_by_id(budget_id)
    return Transaction.none if budget.nil?

    Transaction.where('bank_account_id = ?', bank_account_id)
               .where('transaction_date >= ? and transaction_date <= ?',budget.start_date, budget.end_date)
  end

  def self.update_with_params(params)

    # remove the existing transactions in the period
    Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id]).delete_all

    # re-add the transactions that are being sent
    params[:transactions].each do |transaction_params|
      transaction_params[:bank_account_id] = params[:bank_account_id]
      Transaction.create(transaction_params.except(:id, :payeeName, :payeeCode))


      Payee.update_from_params(transaction_params.slice(:payeeName, :payeeCode, :allocation_id))
    end

    #send back the fixed list of transactions
    Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id])
  end
end
