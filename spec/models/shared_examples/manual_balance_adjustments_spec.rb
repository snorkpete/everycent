
shared_examples_for "ManualBalanceAdjustments" do

    describe ".manually_adjust_balances" do

    before do
      @today = Date.new(2018, 10, 1)
      allow(Date).to receive(:today).and_return(@today)
      @day_after_last_account_close_date = Date.new(2018, 10, 14)
    end

    it "calls #manually_adjust_balance for each bank account in the list" do
      @first_account = create(:bank_account, opening_balance: 40)
      @second_account = create(:bank_account, opening_balance: 120)

      params = [
          { bank_account_id: @first_account.id, new_balance: 200 },
          { bank_account_id: @second_account.id, new_balance: 80 }
      ]

      expect(BankAccount).to receive(:accounts_to_adjust)
                               .with(params)
                               .and_return([@first_account, @second_account])

      BankAccount.manually_adjust_balances(params)
      expect(@first_account.current_balance).to eq 200
      expect(@second_account.current_balance).to eq 80
    end

    it "handles an empty list without throwing an error" do
      expect do
        BankAccount.manually_adjust_balances([])
      end.not_to raise_error
    end

    it "handles invalid bank_account_ids without throwing an error" do
      expect do
        non_existent_bank_account_id = 333
        BankAccount.manually_adjust_balances([{ bank_account_id: non_existent_bank_account_id, new_balance: 5}])
      end.not_to raise_error

    end

  end

  describe "#manually_adjust_balance with no transactions" do
    before do
      @today = Date.new(2018, 10, 1)
      allow(Date).to receive(:today).and_return(@today)
      @day_after_last_account_close_date = Date.new(2018, 10, 14)
      @opening_balance = 300
      @bank_account = create(:bank_account, opening_balance: @opening_balance)

      @new_balance = 500
      @bank_account.manually_adjust_balance(@new_balance)
    end

    it "creates a single transaction" do
      expect(@bank_account.transactions.count).to eq 1
    end

    it "has a manually adjusted amount equal to difference of new balance and current balance" do
      expect(@bank_account.current_balance).to eq @new_balance
      expect(@bank_account.manual_adjustment).to be_truthy
      expect(@bank_account.manual_adjustment.net_amount).to eq @new_balance - @opening_balance
    end
  end

  describe "#manually_adjust_balance" do

    before do
      @today = Date.new(2018, 10, 1)
      expect(Date).to receive(:today).and_return(@today)
      @day_after_last_account_close_date = Date.new(2018, 10, 14)

      @bank_account = create(:bank_account, opening_balance: 300)
      @existing_transaction = create(:transaction, bank_account: @bank_account,
                                     withdrawal_amount: 200,
                                     deposit_amount: 0,
                                     transaction_date: @day_after_last_account_close_date)
    end

    context "when new balance = current balance" do

      context "when no adjustment transaction exists" do
        it "does NOT create a new adjustment transaction" do
          expect do
            new_balance = @bank_account.current_balance
            @bank_account.manually_adjust_balance(new_balance)
          end.not_to change { Transaction.count }
        end
      end

      context "when adjustment transaction already exists" do
        it "does nothing if the adjustment transaction balance is not-zero" do
          @bank_account.transactions.create(description: 'a', withdrawal_amount: 100, deposit_amount: 0,
                                            transaction_date: @day_after_last_account_close_date,
                                            is_manual_adjustment: true )
          new_balance = @bank_account.current_balance
          expect do
            @bank_account.manually_adjust_balance(new_balance)
          end.not_to change { Transaction.count }

        end

        it "removes the adjustment transaction if the transaction net amount is 0 (adjustment transaction is not needed)" do
          # creating a transaction with 0 net amount
          @bank_account.transactions.create(description: 'a', withdrawal_amount: 40, deposit_amount: 40,
                                            transaction_date: @day_after_last_account_close_date,
                                            is_manual_adjustment: true )
          new_balance = @bank_account.current_balance

          expect(@bank_account.manual_adjustment_exists?).to be_truthy
          @bank_account.manually_adjust_balance(new_balance)
          expect(@bank_account.manual_adjustment_exists?).to be_falsey
        end
      end

    end

    context "when new balance is different from current balance" do

      context "when no adjustment transaction exists" do
        it "creates a new adjustment transaction" do
          new_balance = @bank_account.current_balance + 500

          expect do
            @bank_account.manually_adjust_balance(new_balance)
          end.to change { Transaction.count }.by(1)

          expect(@bank_account.manual_adjustment_exists?).to be_truthy
          manual_adjustment = @bank_account.manual_adjustment
          expect(manual_adjustment).not_to be_nil
        end

        it "makes the adjustment transaction amount = diff between old balance and new balance" do
          adjustment = 600
          new_balance = @bank_account.current_balance + adjustment
          @bank_account.manually_adjust_balance(new_balance)

          expect(@bank_account.manual_adjustment.net_amount).to eq adjustment
        end

        it "updates the transaction withdrawal amount if the diff is negative" do
          adjustment = 200
          new_balance = @bank_account.current_balance - adjustment
          @bank_account.manually_adjust_balance(new_balance)

          expect(@bank_account.manual_adjustment.withdrawal_amount).to eq adjustment
          expect(@bank_account.manual_adjustment.deposit_amount).to eq 0
        end

        it "updates the transaction deposit amount if the diff is positive" do
          adjustment = 200
          new_balance = @bank_account.current_balance + adjustment
          @bank_account.manually_adjust_balance(new_balance)

          expect(@bank_account.manual_adjustment.withdrawal_amount).to eq 0
          expect(@bank_account.manual_adjustment.deposit_amount).to eq adjustment
        end

        it "makes the adjustment date equal to day after the closing date" do
          not_important_value = 4
          @bank_account.manually_adjust_balance(not_important_value)
          expect(@bank_account.manual_adjustment.transaction_date).to eq @bank_account.closing_date + 1
        end
      end

      context "when adjustment transaction already exists" do
        before do
          @manual_adjustment_amount = 60
          @bank_account.transactions.create(description: 'Manual Adjustment',
                                            deposit_amount: @manual_adjustment_amount,
                                            transaction_date: @day_after_last_account_close_date,
                                            is_manual_adjustment: true )
        end

        context "diff is equal to adjustment transaction balance" do
          it "removes the adjustment transaction" do
            new_balance = @bank_account.current_balance - @manual_adjustment_amount
            @bank_account.manually_adjust_balance(new_balance)
            expect(@bank_account.manual_adjustment).to be_nil
          end
        end

        context "diff is different to adjustment transaction balance" do
          it "does not create a new adjustment transaction nor remove the existing transaction" do
            some_other_random_amount = 35
            new_balance = @bank_account.current_balance + @manual_adjustment_amount + some_other_random_amount

            expect do
              @bank_account.manually_adjust_balance(new_balance)
            end.not_to change { Transaction.count }
          end

          it "updates the existing transaction amount" do
            # This setup is a bit confusing, so adding some extra validating expectations
            # to explain the current status quo
            #
            #   current balance without the adjustment is 100,
            #   manual adjustment is 60
            #   so current balance is 160
            expect(@bank_account.current_balance_without_manual_adjustment).to eq 100
            expect(@bank_account.manual_adjustment.net_amount).to eq 60
            expect(@bank_account.current_balance).to eq 160

            some_other_random_amount = 35
            new_balance_difference = some_other_random_amount
            new_balance = @bank_account.current_balance_without_manual_adjustment + new_balance_difference
            expect(new_balance).to eq 100 + 35

            @bank_account.manually_adjust_balance(new_balance)
            expect(@bank_account.manual_adjustment.net_amount).to eq new_balance_difference
          end

          it "updates the transaction withdrawal amount if the diff < 0" do
            some_random_amount = 12
            new_balance = @bank_account.current_balance - some_random_amount
            @bank_account.manually_adjust_balance(new_balance)
            expect(@bank_account.manual_adjustment.net_amount).to eq @manual_adjustment_amount - 12
          end

          it "updates the transaction deposit amount if the diff > 0" do
            some_random_amount = 13
            new_balance = @bank_account.current_balance + some_random_amount
            @bank_account.manually_adjust_balance(new_balance)
            expect(@bank_account.manual_adjustment.net_amount).to eq @manual_adjustment_amount + 13
            expect(@bank_account.manual_adjustment.deposit_amount).to eq @manual_adjustment_amount + 13
            expect(@bank_account.manual_adjustment.withdrawal_amount).to eq 0
          end
        end
      end

    end
  end

  describe "#adjustment_transaction_exists?" do

    before do
      @today = Date.new(2018, 10, 1)
      # expect(Date).to receive(:today).and_return(@today)
      @day_after_last_account_close_date = Date.new(2018, 10, 14)

      @bank_account = create(:bank_account, opening_balance: 300)
    end

    it "returns false if there are no transactions" do
      expect(@bank_account.transactions.count).to eq 0
      expect(@bank_account.manual_adjustment_exists?).to be_falsey
    end

    it "return false if there are transactions, but none have the is_adjustment flag" do
      @bank_account.transactions.create(description: 'test',
                                        deposit_amount: 0,
                                        withdrawal_amount: 150,
                                        transaction_date: @day_after_last_account_close_date,
                                        is_manual_adjustment: false)
      expect(@bank_account.manual_adjustment_exists?).to be_falsey
    end
    it "returns true if there is a transaction with the is_adjustment flag" do
      @bank_account.transactions.create(description: 'test',
                                        deposit_amount: 0,
                                        withdrawal_amount: 150,
                                        transaction_date: @day_after_last_account_close_date,
                                        is_manual_adjustment: true)
      expect(@bank_account.manual_adjustment_exists?).to be_truthy
    end
  end

end