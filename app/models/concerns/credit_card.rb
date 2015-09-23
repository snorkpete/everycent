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

  # given the period, finds all unpaid transactions in the given period
  # and creates new transactions in the next period for those unpaid transactions
  # as well as a balancing transaction to offset the additions
  # These new transactions are all labeled as '(b/f)'
  # The original transactions that were copied are marked as 'paid'
  def add_brought_forward_transactions(start_date, end_date)
    return false unless credit_card?

    added_transactions = []
    added_transactions << build_transactions_to_bring_forward(start_date, end_date)

    adjustment = build_adjustment_transaction(start_date, end_date)
    added_transactions << adjustment unless adjustment.net_amount == 0

    self.transactions << added_transactions

    transactions_to_copy(start_date, end_date).update_all status: 'paid',
                                                          brought_forward_status: 'brought_forward'
  end

  # returns the unpaid transactions that are eligible to be
  # copied into the new transaction period
  def transactions_to_copy(start_date, end_date)
    transactions.between(start_date, end_date).unpaid
  end

  # builds the actual new transactions to be added
  # in the new period that mimic the original transactions to be copied
  def build_transactions_to_bring_forward(start_date, end_date)
    brought_forward_date = end_date.tomorrow

    return transactions_to_copy(start_date, end_date).map do |transaction|
      transaction.to_brought_forward_version(brought_forward_date)
    end
  end


  # returns the adjustment transaction that balances the
  # transactions that will be copied to the new period
  def build_adjustment_transaction(start_date, end_date)
    withdrawals = transactions_to_copy(start_date, end_date).sum(:withdrawal_amount) * -1
    deposits = transactions_to_copy(start_date, end_date).sum(:deposit_amount) * -1

    adjustment = Transaction.new withdrawal_amount: withdrawals, deposit_amount: deposits,
                                 description: 'Balance B/F Adj Entry',
                                 transaction_date: end_date.tomorrow,
                                 status: 'unpaid', brought_forward_status: 'added'
    adjustment
  end

  # reverses the addition of the brought forward transactions
  # including the adjustment transaction
  # Also changes the transactions that were copied to bring forward
  # back to 'unpaid'
  def remove_brought_forward_transactions(start_date, end_date)
    # reset the original brought forward transactions back to unpaid
    transactions.between(start_date, end_date)
                .where(brought_forward_status: 'brought_forward', status: 'paid')
                .update_all status: 'unpaid', brought_forward_status: nil

    # remove the (b/f) transactions and the adjusting transaction
    transactions.where('transaction_date >= ?', end_date.tomorrow)
                .where(brought_forward_status: 'added')
                .delete_all
  end

  # the date that the statement period starts, for the current date
  def current_period_statement_start(current_date)

    if Date.valid_date?(current_date.year, current_date.month, statement_day)
      statement_date_in_current_month = Date.new(current_date.year, current_date.month, statement_day)
      if current_date.day < statement_day
        return statement_date_in_current_month.last_month
      else
        return statement_date_in_current_month
      end
    end

    # if exact statement date doesn't exist in the current month
    # then current_day MUST be < statement_day
    # so find the correct day in the previous month
    date_in_previous_month = current_date.last_month
    if Date.valid_date?(date_in_previous_month.year, date_in_previous_month.month, statement_day)
      return Date.new(date_in_previous_month.year, date_in_previous_month.month, statement_day)
    else
      return date_in_previous_month.end_of_month
    end

  end

  def current_period_statement_end(current_date)
    if Date.valid_date?(current_date.year, current_date.month, statement_day)
      statement_date_in_current_month = Date.new(current_date.year, current_date.month, statement_day)
      if current_date.day < statement_day
        return statement_date_in_current_month.prev_day
      else
        return statement_date_in_current_month.next_month.prev_day
      end
    end

    date_in_next_month = current_date.next_month
    if Date.valid_date?(date_in_next_month.year, date_in_next_month.month, statement_day)
      return Date.new(date_in_next_month.year, date_in_next_month.month, statement_day).prev_day
    else
      return date_in_previous_month.end_of_month
    end
  end

  def previous_period_statement_start(current_date)
    current_period_statement_start(current_date).last_month
  end

  def previous_period_statement_end(current_date)
    current_period_statement_end(current_date).last_month
  end
end
