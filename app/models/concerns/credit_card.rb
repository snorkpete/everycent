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
    transactions_to_bring_forward = transactions_between(start_date, end_date).unpaid
    added_transactions = []

    transactions_to_bring_forward.each do |transaction|
      added_transactions << transaction.to_brought_forward_version(brought_forward_date)
    end

    transactions << added_transactions

    transactions_to_bring_forward.update_all status: 'paid', brought_forward_status: 'brought_forward'
  end
end
