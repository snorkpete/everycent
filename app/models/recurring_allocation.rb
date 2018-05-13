# == Schema Information
#
# Table name: recurring_allocations
#
#  id                     :integer          not null, primary key
#  name                   :string           not null
#  amount                 :integer
#  allocation_category_id :integer
#  frequency              :string           default("monthly")
#  allocation_type        :string           default("expense")
#  is_standing_order      :boolean
#  bank_account_id        :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class RecurringAllocation < ApplicationRecord
  validates :name, presence: true

  before_save :fix_name
  before_save :clear_bank_account_if_not_standing_order

  belongs_to :allocation_category
  belongs_to :bank_account

  def to_allocation
    Allocation.new(name: name,
                   amount: amount,
                   allocation_category_id: allocation_category_id,
                   allocation_type: allocation_type,
                   bank_account_id: bank_account_id,
                   is_standing_order: is_standing_order)
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
