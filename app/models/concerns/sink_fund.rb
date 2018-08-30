module SinkFund
  extend ActiveSupport::Concern

  module ClassMethods

    def sink_funds
      where(account_type: 'sink_fund')
    end

    def update_sink_fund(input_params)
      params = extract_sink_fund_params(input_params)

      sink_fund = find(params[:id])

      # TODO: temporarily disable the validation - it has issues that have to be investigated further
      #validate do
      #  sink_fund.check_sink_fund_allocation_balance_against_current_balance(params[:sink_fund_allocations])
      #end

      sink_fund.update_sink_fund_allocations(params[:sink_fund_allocations]) if sink_fund.valid?
      sink_fund
    end

    def extract_sink_fund_params(input_params)
      input_params.permit(:sink_fund => [:id, {sink_fund_allocations: [:id, :name, :amount, :target, :comment, :status, :deleted] }]).require(:sink_fund)
    end
  end

  ## instance methods
  def sink_fund_allocation_balance
    sink_fund_allocations.sum(:amount)
  end

  def is_sink_fund
    account_type == 'sink_fund'
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
end