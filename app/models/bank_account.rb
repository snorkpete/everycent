# == Schema Information
#
# Table name: bank_accounts
#
#  id               :integer          not null, primary key
#  name             :string
#  account_type     :string
#  account_no       :string
#  user_id          :integer
#  institution_id   :integer
#  opening_balance  :integer
#  closing_balance  :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  closing_date     :date
#  account_category :string           default("asset")
#

class BankAccount < ActiveRecord::Base
  include CreditCard

  belongs_to :user
  belongs_to :institution

  has_many :transactions
  has_many :sink_fund_allocations,  -> { order(:status => :desc, :name => :asc) }


  validates :name,  presence: true
  validates :statement_day, :numericality => {:only_integer => true, :greater_than => 0, :less_than => 32, :allow_nil => true}
  validates :payment_due_day, :numericality => {:only_integer => true, :greater_than => 0, :less_than => 32, :allow_nil => true}

  def statement_day_ordinal
    return '' if statement_day.nil?
    statement_day.ordinalize
  end

  def payment_due_day_ordinal
    return '' if payment_due_day.nil?
    payment_due_day.ordinalize
  end

  def self.account_category_order
    order("CASE when account_category='current' THEN 1 ELSE 2 END, account_category, name")
  end

  def update_balance(budget_id, closing_date)
    total_transaction_amount = 0

    transactions = Transaction.for_budget_and_bank(budget_id, self.id).to_a
    transactions.each do |transaction|
      total_transaction_amount += transaction.deposit_amount
      total_transaction_amount -= transaction.withdrawal_amount
    end

    self.closing_balance += total_transaction_amount
    self.closing_date = closing_date
    save
  end

  def current_balance
    transaction_list = transactions.where('transaction_date > ?', closing_date).to_a

    new_transaction_total = transaction_list.sum do |transaction|
      transaction.deposit_amount - transaction.withdrawal_amount
    end

    closing_balance.to_i + new_transaction_total
  end

  def expected_closing_balance
    transaction_list = transactions.where('transaction_date > ? and transaction_date <= ?',
                                          closing_date, next_closing_date).to_a

    new_transaction_total = transaction_list.sum do |transaction|
      transaction.deposit_amount - transaction.withdrawal_amount
    end

    closing_balance.to_i + new_transaction_total
  end

  def next_closing_date
    next_budget_to_close = Budget.where(status: 'open').order(:start_date).first
    return Date.today if next_budget_to_close.nil?

    next_budget_to_close.end_date
  end

  ##############################
  ### Sink Fund related functions
  ### TODO: possibly move these into their own concern/module
  ##############################

  def sink_fund_allocation_balance
    sink_fund_allocations.sum(:amount)
  end

  def is_sink_fund
    account_type == 'sink_fund'
  end

  def self.sink_funds
    self.where(account_type: 'sink_fund')
  end

  def self.update_sink_fund(input_params)
    params = extract_sink_fund_params(input_params)

    sink_fund = BankAccount.find(params[:id])

    # TODO: temporarily disable the validation - it has issues that have to be investigated further
    #validate do
    #  sink_fund.check_sink_fund_allocation_balance_against_current_balance(params[:sink_fund_allocations])
    #end

    sink_fund.update_sink_fund_allocations(params[:sink_fund_allocations]) if sink_fund.valid?
    sink_fund
  end

  def self.extract_sink_fund_params(input_params)
    # TODO this doesn't belong here - was added for unit testing, which isnt an appropriate reason
    params = ActionController::Parameters.new(input_params)
    params.permit(:sink_fund => [:id, {sink_fund_allocations: [:id, :name, :amount, :target, :comment, :status, :deleted] }]).require(:sink_fund)
  end

  def check_sink_fund_allocation_balance_against_current_balance(new_sink_fund_allocations)
    sink_fund_allocation_total = new_sink_fund_allocations.sum do |allocation_param|
      allocation_param[:amount]
    end

    sink_fund_allocation_ids = new_sink_fund_allocations.map do |allocation|
      allocation[:id]
    end

    spent_to_date = Transaction.where(sink_fund_allocation_id: sink_fund_allocation_ids).sum('withdrawal_amount - deposit_amount')

    if sink_fund_allocation_total - spent_to_date > current_balance
      errors.add(:base, "sink_fund_allocation balance exceeds current balance")
    end
  end

  def update_sink_fund_allocations(new_allocations_params)

    # load all the current allocations
    sink_fund_allocations.to_a
    ids_to_delete = []
    new_allocations_params.each do |allocation_params|

      id = allocation_params.fetch(:id, 0).to_i

      case
      when allocation_params[:deleted]
        ids_to_delete << id

      when id == 0
        allocation = SinkFundAllocation.create(allocation_params.except(:deleted))
        sink_fund_allocations << allocation

      else
        allocation = sink_fund_allocations.where(id: allocation_params[:id]).first
        allocation.update(allocation_params.except([:id, :deleted])) if allocation
      end
    end

    # remove any allocations that need to be removed
    sink_fund_allocations.where(id: ids_to_delete).delete_all

    # update the sink fund allocations with their new values
    sink_fund_allocations.reload
  end

  def reverse_transactions_from_sink_fund_allocations(transactions_to_reverse)
    sink_fund_allocations.each do |sink_fund_allocation|
      transaction_total = transactions_to_reverse.where(sink_fund_allocation_id: sink_fund_allocation.id)
                                                .sum('deposit_amount - withdrawal_amount')
      sink_fund_allocation.amount -= transaction_total
      sink_fund_allocation.save
    end
  end

  def apply_transactions_to_sink_fund_allocations(transactions_to_reverse)
    sink_fund_allocations.each do |sink_fund_allocation|
      transaction_total = transactions_to_reverse.where(sink_fund_allocation_id: sink_fund_allocation.id)
                                                .sum('deposit_amount - withdrawal_amount')
      sink_fund_allocation.amount += transaction_total
      sink_fund_allocation.save
    end
  end


  def transfer_allocation(existing_allocation_id, new_allocation_id, amount, date=Date.today)

    return if existing_allocation_id == 0 and new_allocation_id == 0

    # remove the amount from the existing allocation
    transaction_from = transaction_for_transfer(existing_allocation_id, date)
    transaction_from.withdrawal_amount = amount
    self.transactions << transaction_from

    transaction_to = transaction_for_transfer(new_allocation_id, date)
    transaction_to.deposit_amount = amount
    self.transactions << transaction_to

    #self.save
  end

  def transaction_for_transfer(sink_fund_allocation_id, date)
    new_transaction = Transaction.new(sink_fund_allocation_id: sink_fund_allocation_id)
    new_transaction.description = "Internal Allocation Transfer"
    new_transaction.withdrawal_amount = 0
    new_transaction.deposit_amount = 0
    new_transaction.transaction_date = date
    new_transaction.status = 'paid'
    new_transaction
  end

  ##############################
  # end sink fund functions
  ##############################


  ##############################
  #  credit card functions
  ##############################


  ##############################
  # credit card functions
  ##############################
end
