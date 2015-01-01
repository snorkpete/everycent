class RecurringAllocation < ActiveRecord::Base
  validates :name, presence: true

  before_save :fix_name
  before_save :confirm_no_bank_account_if_not_standing_order

  belongs_to :allocation_category
  belongs_to :bank_account

  protected

  def fix_name
    return if self.name.nil?
    self.name = name.titleize
  end

  def confirm_no_bank_account_if_not_standing_order
    self.bank_account_id = nil unless is_standing_order?
  end
end
