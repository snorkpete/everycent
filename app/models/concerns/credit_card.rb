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

  def add_brought_forward_transactions(start_date, end_date)
    return false unless is_credit_card

    added_transactions = []
    transactions_between(start_date, end_date).each do |transaction|
      added_transactions << transaction.to_brought_forward_version
    end

    transactions << added_transactions
  end
end
