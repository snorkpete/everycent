# == Schema Information
#
# Table name: settings
#
#  id                                                :integer          not null, primary key
#  bank_charges_allocation_name                      :string
#  default_allocation_category_id_for_special_events :integer
#  family_type                                       :string           default("couple")
#  husband                                           :string           default("Husband")
#  single_person                                     :string
#  wife                                              :string           default("Wife")
#  created_at                                        :datetime         not null
#  updated_at                                        :datetime         not null
#  household_id                                      :bigint
#  primary_budget_account_id                         :integer
#
# Indexes
#
#  index_settings_on_household_id  (household_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

require 'rails_helper'

RSpec.describe Setting, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe "#primary_budget_account_id" do
    before do
      @bank_account = create(:bank_account)
    end

    it "creates the single settings record if it doesn't exist" do
      Setting.primary_budget_account_id = @bank_account.id
      expect(Setting.count).to eq 1
    end

    it "does not create a second settings record" do
      second_bank_account = create(:bank_account)

      Setting.primary_budget_account_id = @bank_account.id
      expect(Setting.primary_budget_account_id).to eq @bank_account.id

      Setting.primary_budget_account_id = second_bank_account.id
      expect(Setting.primary_budget_account_id).to eq second_bank_account.id
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
    before do
      @bank_account = create(:bank_account)
    end
    it "contains all the relevant keys for couples" do
      Setting.husband = 'Kion'
      Setting.wife = 'Patrice'
      Setting.primary_budget_account_id = @bank_account.id
      Setting.update_family_type_to_couple
      Setting.single_person = "Ignored"

      expect(Setting.as_hash).to eq ({
          husband: 'Kion',
          wife: 'Patrice',
          primary_budget_account_id: @bank_account.id,
          family_type: 'couple',
          default_allocation_category_id_for_special_events: nil
      })
    end

    it "contains all the relevant keys for singles" do
      Setting.husband = 'Kion'
      Setting.wife = 'Patrice'
      Setting.primary_budget_account_id = @bank_account.id
      Setting.update_family_type_to_single
      Setting.single_person = "Jason"

      expect(Setting.as_hash).to eq ({
          primary_budget_account_id: @bank_account.id,
          family_type: 'single',
          single_person: 'Jason',
          default_allocation_category_id_for_special_events: nil
      })
    end
  end
end
