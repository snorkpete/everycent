# == Schema Information
#
# Table name: settings
#
#  id                           :integer          not null, primary key
#  primary_budget_account_id    :integer
#  bank_charges_allocation_name :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#

class Setting < ActiveRecord::Base

  def self.primary_budget_account_id=(account_id)
    get_setting_record.update(primary_budget_account_id: account_id)
  end

  def self.primary_budget_account_id
    get_setting_record.primary_budget_account_id
  end

  def self.bank_charges_allocation_name=(bank_charges_name)
    get_setting_record.update(bank_charges_allocation_name: bank_charges_name)
  end

  def self.bank_charges_allocation_name
    get_setting_record.bank_charges_allocation_name
  end

  def self.husband
    get_setting_record.husband
  end

  def self.husband=(husband)
    get_setting_record.update(husband: husband)
  end

  def self.wife
    get_setting_record.wife
  end

  def self.wife=(wife)
    get_setting_record.update(wife: wife)
  end

  def self.as_hash
    result = {
      primary_budget_account_id: get_setting_record.primary_budget_account_id,
      bank_charges_allocation_name: get_setting_record.bank_charges_allocation_name,
      husband: get_setting_record.husband,
      wife: get_setting_record.wife
    }
    result
  end

  private
  def self.get_setting_record
    setting_record = Setting.first

    if setting_record.nil?
      setting_record = Setting.create
    end

    setting_record
  end
end
