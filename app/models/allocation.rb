# == Schema Information
#
# Table name: allocations
#
#  id                     :integer          not null, primary key
#  name                   :string
#  amount                 :integer
#  budget_id              :integer
#  allocation_category_id :integer
#  allocation_type        :string
#  is_standing_order      :boolean
#  bank_account_id        :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  comment                :string
#  household_id           :bigint(8)
#

class Allocation < ApplicationRecord
  include CumulativeAllocation

  # force this model to always require scoping to a household
  acts_as_tenant :household

  belongs_to :budget
  belongs_to :allocation_category
  belongs_to :bank_account, optional: true
  belongs_to :special_event, optional: true

  has_many :transactions

  before_save :fix_name
  before_save :clear_bank_account_if_not_standing_order

  def self.update_from_params(params)
    result = []

    params.each do |param|
      param = ActiveSupport::HashWithIndifferentAccess.new(param)
      allocation = update_one_from_params(param)

      result << allocation unless allocation.nil?
    end

    result
  end

  def self.update_one_from_params(param)
    id = param.fetch(:id, 0).to_i

    if id == 0
      return nil if param[:deleted]
      return Allocation.create(param.except(:id, :deleted))
    end

    allocation = Allocation.find(id)

    if param[:deleted]
      allocation.destroy
      return nil
    end

    allocation.update(param.except(:deleted))
    allocation
  end

  def self.mass_update(params)
    return false if params[:name].blank?

    ActiveRecord::Base.transaction do
      params[:amounts].each do |amount_data|
        if amount_data[:id] == 0
          if amount_data[:amount] != 0
            attrs = {
              name: params[:name],
              amount: amount_data[:amount],
              budget_id: amount_data[:budget_id],
              allocation_category_id: params[:allocation_category_id]
            }
            attrs[:is_fixed_amount] = amount_data[:is_fixed_amount] unless amount_data[:is_fixed_amount].nil?
            Allocation.create(attrs)
          end
          next
        end

        allocation = Allocation.find_by(id: amount_data[:id])
        next unless allocation

        if amount_data[:amount] == 0
          allocation.destroy
        else
          attrs = { name: params[:name], amount: amount_data[:amount] }
          attrs[:is_fixed_amount] = amount_data[:is_fixed_amount] unless amount_data[:is_fixed_amount].nil?
          allocation.update(attrs)
        end
      end

      true
    end
  end

  def spent
    # TODO: to follow up on why summing in the db causes n+1 queries
    transactions.sum('withdrawal_amount - deposit_amount')
    #
    # Need to sum in Ruby because summing in the db causes N+1 query issue,
    # and :includes does not resolve it
    # transactions.to_a.sum do |transaction|
    #   transaction.withdrawal_amount - transaction.deposit_amount
    # end
  end

  def remaining
    amount - spent
  end

  protected
  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end

  def clear_bank_account_if_not_standing_order
    self.bank_account_id = nil unless is_standing_order?
  end
end
