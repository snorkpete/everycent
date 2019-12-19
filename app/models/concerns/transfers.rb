module Transfers
  extend ActiveSupport::Concern

  module ClassMethods
    def transfer(params)
      from_account = find_by(params[:from])
      return { success: false, reason: "From account doesn't exist" } unless from_account

      from_account.transfer(params)
    end

  end

  def transfer(params)
    return { success: false, reason: "Amount must be greater than 0" } unless params[:amount] > 0
    return { success: false, reason: "Description can't be blank" } if params[:description].blank?

    return { success: false,
             reason: "Can only transfer from EITHER an allocation OR a sink fund allocation, not both"
    } if params[:from_allocation] && params[:from_sink_fund_allocation]

    return { success: false,
             reason: "Can only transfer to EITHER an allocation OR a sink fund allocation, not both"
           } if params[:to_allocation] && params[:to_sink_fund_allocation]

    to_account = BankAccount.find_by(id: params[:to])
    return { success: false, reason: "To account doesn't exist" } unless to_account

    from_transaction = Transaction.new(
      description: "Withdrawal - " + params[:description],
      withdrawal_amount: params[:amount],
      deposit_amount: 0,
      transaction_date: params[:date] || Date.today,
      status: 'paid',
      allocation_id: params[:from_allocation],
      sink_fund_allocation_id: params[:from_sink_fund_allocation],
      )
    transactions << from_transaction

    to_transaction = Transaction.new(
        description: "Deposit - " + params[:description],
        withdrawal_amount: 0,
        deposit_amount: params[:amount],
        transaction_date: params[:date] || Date.today,
        status: 'paid',
        allocation_id: params[:to_allocation],
        sink_fund_allocation_id: params[:to_sink_fund_allocation],
    )
    to_account.transactions << to_transaction

    { success: true }
  end

  def transfer_to_old(existing_allocation_id, new_allocation_id, amount, date=Date.today)

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

  def transaction_for_transfer_2(sink_fund_allocation_id, date)
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