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

shared_examples_for "CreditCard" do

  describe "#is_credit_card" do
    it "returns true if account_type == 'credit_card'" do
      bank_account = build(:bank_account, account_type: 'credit_card')
      expect(bank_account.is_credit_card).to eq true
      expect(bank_account.credit_card?).to eq true
    end

    it "returns true if account_type == 'credit_card'" do
      bank_account = build(:bank_account, account_type: 'normal')
      expect(bank_account.is_credit_card).to eq false
      expect(bank_account.credit_card?).to eq false
    end
  end

  describe "#add_brought_forward_transactions" do
    before do
      @credit_card = create(:bank_account, account_type: 'credit_card')
      @start_date = Date.new(2015,06,23)
      @end_date = Date.new(2015,07,22)
      @inside_date = Date.new(2015,07,01)
      @inside_date_2 = Date.new(2015,07,05)
      @outside_date = Date.new(2015,07,23)
    end

    before do
      @credit_card.transactions << build(:unpaid_transaction, transaction_date: @inside_date,
                                         withdrawal_amount: 400_00, deposit_amount: 0)

      @credit_card.transactions << build(:unpaid_transaction, transaction_date: @inside_date,
                                           withdrawal_amount: 150_00, deposit_amount: 0)

    end

    it "does nothing if the account is not a credit card" do
      @bank_account = create(:bank_account, account_type: 'normal')
      result = @bank_account.add_brought_forward_transactions(@start_date, @end_date)
      expect(result).to eq false
    end

    it "calls #build_transactions_to_bring_forward" do
      expect(@credit_card).to receive(:build_transactions_to_bring_forward)
                              .with(@start_date, @end_date).and_call_original
      @credit_card.add_brought_forward_transactions(@start_date, @end_date)
    end

    it "calls #build_adjustment_transaction" do
      expect(@credit_card).to receive(:build_adjustment_transaction)
                              .with(@start_date, @end_date).and_call_original
      @credit_card.add_brought_forward_transactions(@start_date, @end_date)
    end

    it "marks the original transactions as 'paid' and 'brought_forward'" do
      @credit_card.add_brought_forward_transactions(@start_date, @end_date)
      expect(@credit_card.transactions.first.status).to eq 'paid'
      expect(@credit_card.transactions.second.status).to eq 'paid'
    end

    it "marks the original transactions as brought_forward_status = 'brought_forward'" do
      @credit_card.add_brought_forward_transactions(@start_date, @end_date)
      expect(@credit_card.transactions.first.brought_forward_status).to eq 'brought_forward'
      expect(@credit_card.transactions.second.brought_forward_status).to eq 'brought_forward'
    end

    context "when there is a net balance unpaid" do
      it "adds brought_forward transactions and the adjustment transaction" do
        @credit_card.add_brought_forward_transactions(@start_date, @end_date)
        expect(@credit_card.transactions.size).to eq 5 # 2 original transactions, 2 copies + 1 adjustment
      end
    end

    context "when there no net balance unpaid" do
      it "adds brought_forward transactions only (no adjustment transaction)" do
        balancing_transaction = build(:unpaid_transaction, transaction_date: @inside_date,
                                      withdrawal_amount: 0, deposit_amount: 400_00 + 150_00)
        @credit_card.transactions << balancing_transaction

        adjustment = @credit_card.build_adjustment_transaction(@start_date, @end_date)
        expect(adjustment.net_amount).to eq 0
        @credit_card.add_brought_forward_transactions(@start_date, @end_date)

        # 3 original transactions, 3 copies, no adjustment
        expect(@credit_card.transactions.size).to eq 6
      end

    end

  end

  describe "#build_transactions_to_bring_forward" do
    before do
      @credit_card = create(:bank_account, account_type: 'credit_card')
      @start_date = Date.new(2015,06,23)
      @end_date = Date.new(2015,07,22)
      @inside_date = Date.new(2015,07,01)
      @inside_date_2 = Date.new(2015,07,05)
      @outside_date = Date.new(2015,07,23)
    end

    it "returns new transactions for every transaction not paid in the credit period" do
      @credit_card.transactions << build(:transaction,
                                         transaction_date: @inside_date, status:'unpaid')
      @credit_card.transactions << build(:transaction,
                                         transaction_date: @inside_date_2, status:'unpaid')

      new_transactions = @credit_card.build_transactions_to_bring_forward(@start_date, @end_date)
      expect(new_transactions.size).to eq 2
    end

    it "ignores 'paid' transactions in the credit period" do
      @credit_card.transactions << build(:transaction, transaction_date: @inside_date, status:'paid')

      new_transactions = @credit_card.build_transactions_to_bring_forward(@start_date, @end_date)
      expect(new_transactions.size).to eq 0
    end

    it "ignores'unpaid' transactions outside the credit period" do
      @credit_card.transactions << build(:transaction,
                                         transaction_date: @outside_date, status:'unpaid')
      new_transactions = @credit_card.build_transactions_to_bring_forward(@start_date, @end_date)
      expect(new_transactions.size).to eq 0
    end

    context "when an unpaid transaction exists" do
      before do
        @credit_card.transactions << build(:transaction, transaction_date: @inside_date,
                                      description: 'Racing Wheel', status:'unpaid')

        new_transactions = @credit_card.build_transactions_to_bring_forward(@start_date, @end_date)
        @added_transaction = new_transactions.first
      end

      it "marks the new transactions with transaction date as one day after the end date" do
        expect(@added_transaction.transaction_date).to eq (@end_date + 1)
      end

      it "marks the new transactions as brought_forward_status = 'added'" do
        expect(@added_transaction.brought_forward_status).to eq 'added'
      end

      it "makes the description of those new transactions = old description + (b/f)" do
        expect(@added_transaction.description).to eq 'Racing Wheel (B/F)'
      end

      it "marks the new transaction as brought_forward_status = 'added'" do
        expect(@added_transaction.brought_forward_status).to eq 'added'
      end
    end

  end

  describe "#build_adjustment_transaction" do

    before do
      @credit_card = create(:bank_account, account_type: 'credit_card')
      @start_date = Date.new(2015,06,23)
      @end_date = Date.new(2015,07,22)
      @inside_date = Date.new(2015,07,01)

      @credit_card.transactions << build(:transaction, transaction_date: @inside_date,
                                         withdrawal_amount: 400_00,
                                         deposit_amount: 10_00,
                                         description: 'Racing Wheel', status:'unpaid')

      @credit_card.transactions << build(:transaction, transaction_date: @inside_date,
                                         withdrawal_amount: 150_00,
                                         deposit_amount: 20_00,
                                         description: 'Pedals', status:'unpaid')

      @adjustment_transaction = @credit_card.build_adjustment_transaction(@start_date, @end_date)
    end

    it "creates a transaction with withdrawal_amount = reversal of sum of all withdrawals" do
      expect(@adjustment_transaction.withdrawal_amount).to eq ( 400_00 + 150_00 ) * -1
    end

    it "creates a transaction with deposit_amount = reversal of sum of all deposits" do
      expect(@adjustment_transaction.deposit_amount).to eq ( 10_00 + 20_00 ) * -1
    end

    it "creates a transaction with description as 'Balance B/F Adj Entry'" do
      expect(@adjustment_transaction.description).to eq 'Balance B/F Adj Entry'
    end

    it "creates a transaction with transaction date one day after the end date" do
      expect(@adjustment_transaction.transaction_date).to eq @end_date + 1
    end

    it "creates a transaction with status = 'unpaid'" do
      expect(@adjustment_transaction.status).to eq 'paid'
    end

    it "creates a transaction with brought_forward_status = 'adjustment'" do
      expect(@adjustment_transaction.brought_forward_status).to eq 'adjustment'
    end

  end

  describe "#remove_brought_forward_transactions" do
    before do
      @credit_card = create(:bank_account, account_type: 'credit_card')
      @start_date = Date.new(2015,06,23)
      @end_date = Date.new(2015,07,22)
      @inside_date = Date.new(2015,07,01)
      @inside_date_2 = Date.new(2015,07,05)
      @outside_date = Date.new(2015,07,23)

      @first = build(:transaction, transaction_date: @inside_date,
                                         withdrawal_amount: 400_00,
                                         deposit_amount: 10_00,
                                         description: 'Racing Wheel', status:'unpaid')

      @second = build(:transaction, transaction_date: @inside_date,
                                         withdrawal_amount: 150_00,
                                         deposit_amount: 20_00,
                                         description: 'Pedals', status:'unpaid')
      @credit_card.transactions << @first
      @credit_card.transactions << @second
      @credit_card.add_brought_forward_transactions(@start_date, @end_date)
    end

    it "changes 'brought_forward' transactions in the period back to 'unpaid'" do
      @credit_card.remove_brought_forward_transactions(@start_date, @end_date)

      @first.reload
      @second.reload

      expect(@first.status).to eq 'unpaid'
      expect(@second.status).to eq 'unpaid'
    end
    it "sets the brought_forward_status of 'brought_forward' transactions to nil" do
      @credit_card.remove_brought_forward_transactions(@start_date, @end_date)

      @first.reload
      @second.reload

      expect(@first.brought_forward_status).to eq nil
      expect(@second.brought_forward_status).to eq nil
    end

    it "removes the transactions added in the next period" do
      expect(@credit_card.transactions.size).to eq 5
      expect{
        @credit_card.remove_brought_forward_transactions(@start_date, @end_date)
      }.to change{ Transaction.count }.by(-3)

    end
  end

  describe "Credit Card dates" do
    before do
    end

    context "when statement_day < current day" do
      before do
        @credit_card = build(:bank_account, account_type: 'credit_card', statement_day: 10)
        @today = Date.new(2015, 10, 11)
      end

      it "#current_period_statement_start returns the day after statement_day in the current month" do
        expect(@credit_card.current_period_statement_start(@today)).to eq Date.new(2015, 10, 11)
      end

      it "#current_period_statement_end returns the date of the statement_day in the next month" do
        expect(@credit_card.current_period_statement_end(@today)).to eq Date.new(2015, 11, 10)
      end

      it "#previous_period_statement_start returns the date after the statement_day in the previous month" do
        expect(@credit_card.previous_period_statement_start(@today)).to eq Date.new(2015, 9, 11)
      end
      it "#previous_period_statement_end returns the statement_day in the current month" do
        expect(@credit_card.previous_period_statement_end(@today)).to eq Date.new(2015, 10, 10)
      end
    end

    context "when current day == statement_day" do
      before do
        @credit_card = build(:bank_account, account_type: 'credit_card', statement_day: 10)
        @today = Date.new(2015, 12, 10)
      end

      it "#current_period_statement_start returns the day after statement_day in the previous month" do
        expect(@credit_card.current_period_statement_start(@today)).to eq Date.new(2015, 11, 11)
      end

      it "#current_period_statement_end returns the statement_day in the current month" do
        expect(@credit_card.current_period_statement_end(@today)).to eq Date.new(2015, 12, 10)
      end

      it "#previous_period_statement_start returns the day after the statement_day in the 2nd month prior" do
        expect(@credit_card.previous_period_statement_start(@today)).to eq Date.new(2015, 10, 11)
      end

      it "#previous_period_statement_end returns the statement_day in the previous month" do
        expect(@credit_card.previous_period_statement_end(@today)).to eq Date.new(2015, 11, 10)
      end
    end

    context "when current day < statement_day" do
      before do
        @credit_card = build(:bank_account, account_type: 'credit_card', statement_day: 10)
        @today = Date.new(2015, 1, 1)
      end

      it "#current_period_statement_start returns the date after statement_day in the previous month" do
        expect(@credit_card.current_period_statement_start(@today)).to eq Date.new(2014, 12, 11)
      end

      it "#current_period_statement_end returns the statement_day in the current month" do
        expect(@credit_card.current_period_statement_end(@today)).to eq Date.new(2015, 1, 10)
      end

      it "#previous_period_statement_start returns the day after statement_day in the 2nd month prior" do
        expect(@credit_card.previous_period_statement_start(@today)).to eq Date.new(2014, 11, 11)
      end

      it "#previous_period_statement_end returns the statement_day in the previous month" do
        expect(@credit_card.previous_period_statement_end(@today)).to eq Date.new(2014, 12, 10)
      end
    end

    context "when the current month doesn't have the day before the statement day" do
      before do
        @credit_card = build(:bank_account, account_type: 'credit_card', statement_day: 30)
        @today = Date.new(2015, 2, 15)
      end

      it "#current_period_statement_start returns the date after statement_day in the previous month" do
        expect(@credit_card.current_period_statement_start(@today)).to eq Date.new(2015, 1, 31)
      end

      it "#current_period_statement_end returns the last date in the current month" do
        expect(@credit_card.current_period_statement_end(@today)).to eq Date.new(2015, 2, 28)
      end
    end


    context "when payment_due_day < statement day < current day" do
      before do
        @credit_card = build(:bank_account, account_type: 'credit_card', payment_due_day: 1, statement_day: 10)
        @today = Date.new(2015, 10, 24)
      end

      it "#current_period_payment_due returns the payment_due_day in the next month" do
        expect(@credit_card.current_period_payment_due(@today)).to eq Date.new(2015, 12, 1)
      end

      it "#previous_period_payment_due returns the payment_due_day in the current month" do
        expect(@credit_card.previous_period_payment_due(@today)).to eq Date.new(2015, 11, 1)
      end
    end

    context "when payment_due_day < current day < statement day" do
      before do
        @credit_card = build(:bank_account, account_type: 'credit_card', payment_due_day: 1, statement_day: 10)
        @today = Date.new(2015, 2, 5)
      end

      it "#current_period_payment_due returns the payment_due_day in the next month" do
        expect(@credit_card.current_period_payment_due(@today)).to eq Date.new(2015, 3, 1)
      end

      it "#previous_period_payment_due returns the payment_due_day in the current month" do
        expect(@credit_card.previous_period_payment_due(@today)).to eq Date.new(2015, 2, 1)
      end
    end
1
    context "when payment_due_day > statement day" do
      before do
        @credit_card = build(:bank_account, account_type: 'credit_card', payment_due_day: 16, statement_day: 10)
        @today = Date.new(2015, 2, 15)
      end

      it "#current_period_payment_due returns the payment_due_day in the current month" do
        expect(@credit_card.current_period_payment_due(@today)).to eq Date.new(2015, 3, 16)
      end

      it "#previous_period_payment_due returns the payment_due_day in the current month" do
        expect(@credit_card.previous_period_payment_due(@today)).to eq Date.new(2015, 2, 16)
      end
    end



  end # end of Credit Card dates

end

