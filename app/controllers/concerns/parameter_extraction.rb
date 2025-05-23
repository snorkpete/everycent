module ParameterExtraction
  extend ActiveSupport::Concern

  included do
  end

  module ClassMethods
  end

  def extract_income_params(input_params)
    params = input_params.permit(:incomes => [:id, :name, :amount, :bank_account, :bank_account_id, :budget_id, :deleted, :comment]).require(:incomes)
    params.map(&:to_h)
  end

  def extract_allocation_params(input_params)
    params = input_params.permit(:allocations => [
      :id, :name, :amount, :budget_id, :allocation_category_id, :allocation_type, :is_standing_order,
      :bank_account_id, :budget_id, :deleted, :comment, :allocation_class, :is_fixed_amount]).require(:allocations)
    params.map(&:to_h)
  end
end
