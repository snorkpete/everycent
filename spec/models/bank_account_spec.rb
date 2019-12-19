# == Schema Information
#
# Table name: bank_accounts
#
#  id                         :integer          not null, primary key
#  name                       :string
#  account_type_description   :string
#  account_no                 :string
#  user_id                    :integer
#  institution_id             :integer
#  opening_balance            :integer
#  closing_balance            :integer
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  closing_date               :date
#  account_category           :string           default("asset")
#  allow_default_allocations  :boolean          default(FALSE)
#  default_sub_account_amount :integer          default(0)
#  status                     :string           default("open")
#  account_type               :string           default("normal")
#  statement_day              :integer
#  payment_due_day            :integer
#  is_cash                    :boolean          default(TRUE)
#  import_format              :string           default("")
#  household_id               :bigint(8)
#

require 'rails_helper'

require 'models/shared_examples/credit_card_spec'
require 'models/shared_examples/sink_fund_spec'
require 'models/shared_examples/manual_balance_adjustments_spec'
require 'models/shared_examples/transfers_spec'

RSpec.describe BankAccount, :type => :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  context "when saved" do

    let(:bank_account) { BankAccount.create }

    it "has an account_category" do
      expect(bank_account.account_category).to eq 'asset'
    end
  end

  context "when created" do
    before do
      @today = Date.new(2018, 5, 25)
      expect(Date).to receive(:today).and_return @today
    end

    let(:bank_account) { create(:bank_account, opening_balance: 4000) }

    it "defaults the closing balance to the opening balance" do
      expect(bank_account.closing_balance).to eq(4000)
    end

    it "defaults the closing date to the current date" do
      expect(bank_account.closing_date).to eq(@today)
    end

    it "persists these values properly" do
      same_bank_account = BankAccount.find(bank_account.id)

      expect(same_bank_account.closing_balance).to eq(4000)
      expect(same_bank_account.closing_date).to eq(@today)
    end

  end

  include_examples "CreditCard"
  include_examples "SinkFund"
  include_examples "ManualBalanceAdjustments"
  include_examples "Transfers"

end
