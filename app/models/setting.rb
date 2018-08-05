# == Schema Information
#
# Table name: settings
#
#  id                           :integer          not null, primary key
#  primary_budget_account_id    :integer
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#

class Setting < ApplicationRecord

  def self.primary_budget_account_id=(account_id)
    get_setting_record.update(primary_budget_account_id: account_id)
  end

  def self.primary_budget_account_id
    get_setting_record.primary_budget_account_id
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
