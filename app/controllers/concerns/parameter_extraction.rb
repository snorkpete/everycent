module ParameterExtraction
  extend ActiveSupport::Concern

  included do
  end

  module ClassMethods
  end

  def extract_income_params(input_params)
    new_params = ActionController::Parameters.new(input_params)
    new_params.permit(:incomes => [:id, :name, :amount, :bank_account, :bank_account_id, :budget_id, :deleted]).require(:incomes)
  end
end
