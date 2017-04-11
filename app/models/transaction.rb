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

class Transaction < ActiveRecord::Base

  belongs_to :allocation
  belongs_to :bank_account
  belongs_to :sink_fund_allocation

  before_save :check_status

  def self.preloaded
    includes({ allocation: :allocation_category }, { bank_account: :institution })
  end

  def self.for_budget_and_bank(budget_id, bank_account_id)

    # find the budget
    budget = Budget.find_by_id(budget_id)
    return Transaction.none if budget.nil?

    Transaction.where('bank_account_id = ?', bank_account_id)
               .where('transaction_date >= ? and transaction_date <= ?',budget.start_date, budget.end_date)
  end

  def self.by_allocation(allocation_id)
    Transaction.where('allocation_id = ?', allocation_id)
  end

  def self.by_sink_fund_allocation(allocation_id)
    Transaction.where('sink_fund_allocation_id = ?', allocation_id)
  end

  def self.by_credit_card(bank_account_id)
    credit_card = BankAccount.where(id: bank_account_id).first
    return Transaction.none if credit_card.nil? || !credit_card.credit_card?

    start = credit_card.previous_period_statement_start
    credit_card.transactions.between(start, Date.today)
  end

  def self.between(start_date, end_date)
     where('transaction_date >= ? and transaction_date <= ?', start_date, end_date)
  end

  def self.unpaid
    where(status: 'unpaid')
  end

  def self.update_with_params(params)

    sink_fund = BankAccount.sink_funds.where(id: params[:bank_account_id]).includes(:sink_fund_allocations).first

    # remove the existing transactions in the period
    #previous_transactions = Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id])
    #sink_fund.reverse_transactions_from_sink_fund_allocations(previous_transactions) if sink_fund
    #previous_transactions.delete_all
    Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id]).delete_all

    # re-add the transactions that are being sent
    if params[:transactions]
      params[:transactions].each do |transaction_params|
        transaction_params[:bank_account_id] = params[:bank_account_id]

        Transaction.create(transaction_params.except(:id))
        Payee.update_from_params(transaction_params.slice(:payee_name, :payee_code, :allocation_id))
      end
    end

    #new_transactions = Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id])
    #sink_fund.apply_transactions_to_sink_fund_allocations(new_transactions) if sink_fund

    ##send back the fixed list of transactions
    #new_transactions

    ##send back the fixed list of transactions
    Transaction.for_budget_and_bank(params[:budget_id], params[:bank_account_id])
  end

  def paid
    return status == 'paid'
  end

  def check_status
    return true if status.present?

    if bank_account && bank_account.account_type == 'credit_card' && withdrawal?
      self.status = 'unpaid'
    else
      self.status = 'paid'
    end
  end

  def to_brought_forward_version(brought_forward_date)
    new_transaction = dup
    new_transaction.description = "#{description} (B/F)"
    new_transaction.transaction_date = brought_forward_date
    new_transaction.status = 'unpaid'
    new_transaction.brought_forward_status = 'added'
    new_transaction
  end

  def net_amount
    deposit_amount - withdrawal_amount
  end

  def deposit?
    net_amount > 0
  end

  def withdrawal?
    net_amount <= 0
  end
end
