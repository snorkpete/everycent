# == Schema Information
#
# Table name: incomes
#
#  id              :integer          not null, primary key
#  name            :string
#  amount          :integer
#  budget_id       :integer
#  bank_account_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class Income < ActiveRecord::Base

  belongs_to :budget
  belongs_to :bank_account

  def self.update_from_params(params)
    result = []

    params.each do |param|
      param = HashWithIndifferentAccess.new(param)
      income = update_one_from_params(param)

      result << income unless income.nil?
    end

    result
  end

  def self.update_one_from_params(param)
    id = param.fetch(:id, 0).to_i

    if id == 0
      return nil if param[:deleted]
      return Income.new(param.except(:deleted))
    end

    income = Income.find(id)

    if param[:deleted]
      income.destroy
      return nil
    end

    income.update(param.except(:deleted))
    income
  end
end
