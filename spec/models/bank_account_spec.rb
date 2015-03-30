# == Schema Information
#
require 'rails_helper'

RSpec.describe BankAccount, :type => :model do

  context "when saved" do

    let(:bank_account) { BankAccount.create }

    it "has an account_category" do
      expect(bank_account.account_category).to eq 'asset'
    end
  end
end
