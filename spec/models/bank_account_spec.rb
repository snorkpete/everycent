# == Schema Information
#
# Table name: bank_accounts
#
#  id                         :integer          not null, primary key
#  account_category           :string           default("asset")
#  account_no                 :string
#  account_type               :string           default("normal")
#  account_type_description   :string
#  allow_default_allocations  :boolean          default(FALSE)
#  closing_balance            :integer
#  closing_date               :date
#  default_sub_account_amount :integer          default(0)
#  import_format              :string           default("")
#  is_cash                    :boolean          default(TRUE)
#  name                       :string
#  opening_balance            :integer
#  payment_due_day            :integer
#  statement_day              :integer
#  status                     :string           default("open")
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  asset_bank_account_id      :integer
#  household_id               :bigint
#  institution_id             :integer
#  user_id                    :integer
#
# Indexes
#
#  index_bank_accounts_on_asset_bank_account_id  (asset_bank_account_id)
#  index_bank_accounts_on_household_id           (household_id)
#  index_bank_accounts_on_institution_id         (institution_id)
#  index_bank_accounts_on_user_id                (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (asset_bank_account_id => bank_accounts.id)
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
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

  context "asset_bank_account association" do
    it "belongs_to asset_bank_account" do
      asset = create(:bank_account, account_category: 'asset')
      loan = create(:bank_account, account_category: 'liability', asset_bank_account: asset)
      expect(loan.asset_bank_account).to eq asset
    end

    it "has_many loans" do
      asset = create(:bank_account, account_category: 'asset')
      loan1 = create(:bank_account, account_category: 'liability', asset_bank_account: asset)
      loan2 = create(:bank_account, account_category: 'liability', asset_bank_account: asset)
      expect(asset.loans).to match_array([loan1, loan2])
    end
  end

  context "asset_bank_account_id validation" do
    it "is valid when a liability has an asset_bank_account_id" do
      asset = create(:bank_account, account_category: 'asset')
      loan = build(:bank_account, account_category: 'liability', asset_bank_account: asset)
      expect(loan).to be_valid
    end

    it "is invalid when a non-liability has an asset_bank_account_id" do
      asset = create(:bank_account, account_category: 'asset')
      other_asset = build(:bank_account, account_category: 'asset', asset_bank_account: asset)
      expect(other_asset).not_to be_valid
      expect(other_asset.errors[:asset_bank_account_id]).to include('can only be set on liability accounts')
    end

    it "is valid when a non-liability has no asset_bank_account_id" do
      account = build(:bank_account, account_category: 'asset', asset_bank_account: nil)
      expect(account).to be_valid
    end

    it "is valid when a liability has no asset_bank_account_id" do
      account = build(:bank_account, account_category: 'liability', asset_bank_account: nil)
      expect(account).to be_valid
    end
  end

  include_examples "CreditCard"
  include_examples "SinkFund"
  include_examples "ManualBalanceAdjustments"
  include_examples "Transfers"
end
