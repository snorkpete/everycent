# == Schema Information
#
# Table name: settings
#
#  id                           :integer          not null, primary key
#  primary_budget_account_id    :integer
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#

require 'rails_helper'

RSpec.describe Setting, type: :model do

  describe "#primary_budget_account_id" do
    it "creates the single settings record if it doesn't exist" do
      Setting.primary_budget_account_id = 4
      expect(Setting.count).to eq 1
    end

    it "does not create a second settings record" do
      Setting.primary_budget_account_id = 4
      expect(Setting.primary_budget_account_id).to eq 4

      Setting.primary_budget_account_id = 5
      expect(Setting.primary_budget_account_id).to eq 5
      expect(Setting.count).to eq 1
    end

  end

  describe "#family_type" do
    it "defaults to 'couple'" do
      expect(Setting.family_type).to eq 'couple'
    end

    it "can be changed to 'single'" do
      Setting.update_family_type_to_single
      expect(Setting.family_type).to eq 'single'
    end

    it "can be changed to 'couple'" do
      Setting.update_family_type_to_single
      expect(Setting.family_type).to eq 'single'

      Setting.update_family_type_to_couple
      expect(Setting.family_type).to eq 'couple'
    end
  end

  describe "#single_name" do
    it "defaults to 'couple'" do
      expect(Setting.family_type).to eq 'couple'
    end

    it "updates the single_person" do
      Setting.single_person = 'Jeneil'
      expect(Setting.single_person).to eq 'Jeneil'
    end
  end

  describe "#as_hash" do
    it "contains all the relevant keys for couples" do
      Setting.husband = 'Kion'
      Setting.wife = 'Patrice'
      Setting.primary_budget_account_id = 4
      Setting.update_family_type_to_couple
      Setting.single_person = "Ignored"

      expect(Setting.as_hash).to eq ({
          husband: 'Kion',
          wife: 'Patrice',
          primary_budget_account_id: 4,
          family_type: 'couple'
      })
    end

    it "contains all the relevant keys for singles" do
      Setting.husband = 'Kion'
      Setting.wife = 'Patrice'
      Setting.primary_budget_account_id = 4
      Setting.update_family_type_to_single
      Setting.single_person = "Jason"

      expect(Setting.as_hash).to eq ({
          primary_budget_account_id: 4,
          family_type: 'single',
          single_person: 'Jason'
      })
    end
  end
end
