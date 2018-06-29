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
#  comment         :string
#

class Income < ApplicationRecord

  belongs_to :budget
  belongs_to :bank_account

  def self.update_from_params(params)
    result = []

    params.each do |param|
      param = ActiveSupport::HashWithIndifferentAccess.new(param)
      income = update_one_from_params(param)

      result << income unless income.nil?
    end

    result
  end

  def self.update_one_from_params(param)
    id = param.fetch(:id, 0).to_i

    if id == 0
      return nil if param[:deleted]
      return Income.new(param.except(:id, :deleted))
    end

    income = Income.find(id)

    if param[:deleted]
      income.destroy
      return nil
    end

    income.update(param.except(:deleted))
    income
  end

  def self.mass_update(params)
    # @params = { type: 'income', name: 'Groceries', amounts:[
    #     { id: @may_income.id, amount: 600 },
    #     { id: @june_income.id, amount: 800 },
    #     { id: @july_income.id, amount: 1000 },
    # ]}
    return false if params[:name].blank?

    params[:amounts].each do |amount_data|

      if amount_data[:id] == 0
        Income.create(
                  name: params[:name],
                  amount: amount_data[:amount],
                  budget_id: amount_data[:budget_id],
                  bank_account_id: amount_data[:bank_account_id]
        ) if amount_data[:amount] != 0
        next
      end

      income = Income.find_by_id amount_data[:id]
      return unless income

      if amount_data[:amount] == 0
        income.destroy
      else
        income.update(name: params[:name], amount: amount_data[:amount])
      end
    end

    true
  end

end
