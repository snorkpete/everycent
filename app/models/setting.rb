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

  def self.family_type
    get_setting_record.family_type
  end

  def self.update_family_type_to_single
    get_setting_record.update(family_type: 'single')
  end

  def self.update_family_type_to_couple
    get_setting_record.update(family_type: 'couple')
  end

  def self.single_person
    get_setting_record.single_person
  end

  def self.single_person=(single_person)
    get_setting_record.update(single_person: single_person)
  end

  def self.as_hash
    setting_record = get_setting_record
    if setting_record.family_type == 'single'
      return {
          primary_budget_account_id: setting_record.primary_budget_account_id,
          family_type: setting_record.family_type,
          single_person: setting_record.single_person
      }
    else
      return {
          primary_budget_account_id: setting_record.primary_budget_account_id,
          husband: setting_record.husband,
          wife: setting_record.wife,
          family_type: setting_record.family_type
      }
    end
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
