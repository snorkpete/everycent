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

  def self.as_hash
    result = {
      primary_budget_account_id: get_setting_record.primary_budget_account_id,
      bank_charges_allocation_name: get_setting_record.bank_charges_allocation_name
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
