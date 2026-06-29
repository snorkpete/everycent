# == Schema Information
#
# Table name: incomes
#
#  id              :integer          not null, primary key
#  amount          :integer
#  comment         :string
#  name            :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  bank_account_id :integer
#  budget_id       :integer
#  household_id    :bigint
#
# Indexes
#
#  index_incomes_on_bank_account_id  (bank_account_id)
#  index_incomes_on_budget_id        (budget_id)
#  index_incomes_on_household_id     (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

class Income < ApplicationRecord
  # force this model to always require scoping to a household
  acts_as_tenant :household

  belongs_to :budget
  belongs_to :bank_account, optional: true

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
    return false if params[:name].blank?

    ActiveRecord::Base.transaction do
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
        next unless income

        if amount_data[:amount] == 0
          income.destroy
        else
          income.update(name: params[:name], amount: amount_data[:amount])
        end
      end

      true
    end
  end

end
