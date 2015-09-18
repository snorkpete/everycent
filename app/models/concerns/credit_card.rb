module CreditCard
  extend ActiveSupport::Concern

  included do
  end

  module ClassMethods
  end

  # instance methods go here

  def add_brought_forward_transactions(start_date, end_date)
    return false
  end
end
