# == Schema Information
#
# Table name: bank_accounts
#
#  id               :integer          not null, primary key
#  name             :string
#  account_type     :string
#  account_no       :string
#  user_id          :integer
#  institution_id   :integer
#  opening_balance  :integer
#  closing_balance  :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  closing_date     :date
#  account_category :string           default("asset")
#

shared_examples_for "CreditCard" do

  describe "#add_brought_forward_transactions" do
    before do
      @credit_card = create(:bank_account, account_type: 'credit_card')
      @start_date = '2015-06-23'
      @end_date = '2015-07-22'
    end

    it "does nothing if the account is not a credit card" do
      @bank_account = create(:bank_account)
      result = @bank_account.add_brought_forward_transactions(@start_date, @end_date)
      expect(result).to eq false
    end
    it "adds new transactions for every transaction not paid in the credit period"
    it "marks the new transactions with transaction date as one day after the end date"
    it "marks the new transactions as brought_forward_status = 'added'"
    it "makes the description of those new transactions = old description + (b/f)"
    it "marks the not-paid transactions as 'paid'"
    it "marks the not-paid transactions as brought_forward_status = 'brought_forward'"
    it "creates a new transaction that is a sum of all 'added' transactions * -1"
    it "labels the newly created transaction description as 'Balance B/F Adj Entry'"
    it "marks the new transaction as brought_forward_status = 'added'"
  end

  describe "#remove_brought_forward_transactions" do
    it "does nothing if the account is not a credit card"
    it "changes brought_forward_status='brought_forward' transactions in the period back to 'unpaid'"
    it "sets the brought_forward_status='brought_forward' transactions to nil"
    it "removes transactions in the new period with brought_forward_status = 'added'"
  end
end

