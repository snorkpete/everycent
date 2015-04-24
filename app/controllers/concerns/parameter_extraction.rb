module ParameterExtraction
  extend ActiveSupport::Concern

  included do
  end

  module ClassMethods
  end

  def extract_income_params(input_params)
    new_params = ActionController::Parameters.new(input_params)
    new_params.permit(:incomes => [:id, :name, :amount, :bank_account, :bank_account_id, :budget_id, :deleted, :comment]).require(:incomes)
  end

  def extract_allocation_params(input_params)
    new_params = ActionController::Parameters.new(input_params)
    new_params.permit(:allocations => [
      :id, :name, :amount, :budget_id, :allocation_category_id, :allocation_type, :is_standing_order,
      :bank_account_id, :budget_id, :deleted, :comment]).require(:allocations)
  end
end
