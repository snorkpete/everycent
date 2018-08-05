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
    end


    end

  end
  
end
