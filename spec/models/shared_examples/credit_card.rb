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

  describe "#is_credit_card" do
    it "returns true if account_type == 'credit_card'" do
      bank_account = build(:bank_account, account_type: 'credit_card')
      expect(bank_account.is_credit_card).to eq true
    end

    it "returns true if account_type == 'credit_card'" do
      bank_account = build(:bank_account, account_type: 'normal')
      expect(bank_account.is_credit_card).to eq false
    end
  end

  describe "#add_brought_forward_transactions" do
    before do
      @credit_card = create(:bank_account, account_type: 'credit_card')
      @start_date = '2015-06-23'
      @end_date = '2015-07-22'
      @inside_date = '2015-07-01'
      @inside_date_2 = '2015-07-05'
      @outside_date = '2015-07-23'
    end

    it "does nothing if the account is not a credit card" do
      @bank_account = create(:bank_account, account_type: 'normal')
      result = @bank_account.add_brought_forward_transactions(@start_date, @end_date)
      expect(result).to eq false
    end

    it "adds new transactions for every transaction not paid in the credit period" do
      @credit_card.transactions << create(:transaction, transaction_date: @inside_date, status:'paid')
      @credit_card.transactions << create(:transaction, transaction_date: @inside_date_2, status:'paid')

      expect{
        @credit_card.add_brought_forward_transactions(@start_date, @end_date)
      }.to change{ Transaction.count }.by(2)
    end

    it "does not add brought forward transactions for 'paid' transactions in the credit period"
    it "does not add brought forward transactions for 'unpaid' transactions outside the credit period"
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

