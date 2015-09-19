module CreditCard
  extend ActiveSupport::Concern

  included do
  end

  module ClassMethods
  end

  # instance methods go here

  def is_credit_card
    account_type == 'credit_card'
  end

  def credit_card?
    is_credit_card
  end

  def add_brought_forward_transactions(start_date, end_date)
    return false unless is_credit_card

    brought_forward_date = end_date.tomorrow
    transactions_to_bring_forward = transactions.between(start_date, end_date).unpaid
    added_transactions = []

    transactions_to_bring_forward.each do |transaction|
      added_transactions << transaction.to_brought_forward_version(brought_forward_date)
    end

    adjustment_transaction = Transaction.new description: '',
                                             transaction_date: brought_forward_date,
                                             withdrawal_amount: 0, deposit_amount: 0

    #added_transactions << adjustment_transaction
    transactions << added_transactions

    transactions_to_bring_forward.update_all status: 'paid', brought_forward_status: 'brought_forward'
  end

  def transactions_to_bring_forward(start_date, end_date)
    transactions.between(start_date, end_date).unpaid
  end

  def build_transactions_to_bring_forward(start_date, end_date)
    brought_forward_date = end_date.tomorrow

    return transactions_to_bring_forward(start_date, end_date).map do |transaction|
      transaction.to_brought_forward_version(brought_forward_date)
    end
  end

  def build_adjustment_transaction(start_date, end_date)
    withdrawals = transactions_to_bring_forward(start_date, end_date).sum(:withdrawal_amount) * -1
    deposits = transactions_to_bring_forward(start_date, end_date).sum(:deposit_amount) * -1

    adjustment = Transaction.new withdrawal_amount: withdrawals, deposit_amount: deposits,
                                 description: 'Balance B/F Adj Entry', 
                                 transaction_date: end_date.tomorrow
    adjustment
  end
end
