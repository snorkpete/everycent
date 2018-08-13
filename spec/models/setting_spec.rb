# == Schema Information
#
# Table name: settings
#
#  id                           :integer          not null, primary key
#  primary_budget_account_id    :integer
#  bank_charges_allocation_name :string
#  created_at                   :datetime         not null
#  updated_at                   :datetime         not null
#  husband                      :string           default("Husband")
#  wife                         :string           default("Wife")
#  family_type                  :string           default("couple")
#  single_person                :string
#  household_id                 :bigint(8)
#

require 'rails_helper'

RSpec.describe Setting, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

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
