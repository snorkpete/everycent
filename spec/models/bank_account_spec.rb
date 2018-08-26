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

  describe "#update_sink_fund" do
    context "with 2 sink_fund_allocation params" do
      before :each do
        @sink_fund = create(:bank_account, account_type: 'sink_fund', closing_balance: 10_000_00)
        @sink_fund_params = HashWithIndifferentAccess.new({ "sink_fund"=>
                              {"id"=> @sink_fund.id.to_s,
                                "sink_fund_allocations"=>[
                                  {"amount"=>3000_00, "name"=>"First"},
                                  {"amount"=>4000_00, "name"=>"sdon"}
                                 ]
                              }
                            })
        @sink_fund_params = ActionController::Parameters.new(@sink_fund_params)
      end

      it "creates 2 sink_fund_allocations" do
        sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
        expect(sink_fund.sink_fund_allocations.size).to eq 2
      end

      it "updates existing sink_fund_allocations" do
        @sink_fund.sink_fund_allocations << SinkFundAllocation.new(amount: 100, name: 'first to update')
        @sink_fund.sink_fund_allocations << SinkFundAllocation.new(amount: 100, name: 'second to update')

        @sink_fund_params[:sink_fund][:sink_fund_allocations] = [
            {id: @sink_fund.sink_fund_allocations[0].id, "amount"=>3000_00, "name"=>"First"},
            {id: @sink_fund.sink_fund_allocations[1].id, "amount"=>4000_00, "name"=>"sdon"}
        ]

        @sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
        expect(@sink_fund.sink_fund_allocations[0].amount).to eq 3000_00
        expect(@sink_fund.sink_fund_allocations[1].amount).to eq 4000_00
      end

      context "when sink_fund_allocation total is more than account balance" do
        it "does not save" do
          pending "validations removed temporarily"
          @sink_fund_params["sink_fund"]["sink_fund_allocations"] << { amount: 4000_00, name: 'Too much'}
          sink_fund = BankAccount.update_sink_fund(@sink_fund_params)
          expect(sink_fund).to be_invalid
        end
      end
    end
  end


  describe "#reverse_transactions_from_sink_fund_allocations" do
    before do
      @sink_fund = create(:bank_account, account_type: 'sink_fund',
                          closing_balance: 4000_00, closing_date: '2014-12-31')
    end

    it "reverses the sink_fund_allocation balances" do
      @sink_fund_allocation = create(:sink_fund_allocation, name: 'First',
                                     amount: 2000_00, bank_account: @sink_fund)
      transaction = create(:transaction, withdrawal_amount: 500_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      @sink_fund.reverse_transactions_from_sink_fund_allocations(Transaction.where(id: transaction.id))
      expect(@sink_fund.sink_fund_allocations.first.amount).to eq 2500_00
    end

    it "reverses the sink_fund_allocation balances of multiple sink_fund_allocations" do
      @sink_fund_allocation = create(:sink_fund_allocation, name: 'First',
                                     amount: 2000_00, bank_account: @sink_fund)

      @second_sink_fund_allocation = create(:sink_fund_allocation, name: 'Second',
                                            amount: 1000_00, bank_account: @sink_fund)

      transactions = []
      transactions << create(:transaction, withdrawal_amount: 500_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 700_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 100_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @second_sink_fund_allocation)
      transaction_ids = transactions.map(&:id)
      @sink_fund.reverse_transactions_from_sink_fund_allocations(Transaction.where(id: transaction_ids))
      expect(@sink_fund.sink_fund_allocations.first.amount).to eq 3200_00
      expect(@sink_fund.sink_fund_allocations.second.amount).to eq 1100_00
    end

  end

  describe "#apply_transactions_to_sink_fund_allocations" do
    before do
      @sink_fund = create(:bank_account, account_type: 'sink_fund',
                          closing_balance: 5000_00, closing_date: '2014-12-31')
    end

    it "updates the sink_fund_allocation balances of multiple sink_fund_allocations" do
      @sink_fund_allocation = create(:sink_fund_allocation, name: 'First',
                                     amount: 3500_00, bank_account: @sink_fund)

      @second_sink_fund_allocation = create(:sink_fund_allocation, name: 'Second',
                                            amount: 1200_00, bank_account: @sink_fund)

      transactions = []
      transactions << create(:transaction, withdrawal_amount: 0, deposit_amount: 400_00,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 600_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @sink_fund_allocation)
      transactions << create(:transaction, withdrawal_amount: 900_00, deposit_amount: 0,
                           transaction_date: '2015-01-12',
                           bank_account: @sink_fund,
                           sink_fund_allocation: @second_sink_fund_allocation)
      transaction_ids = transactions.map(&:id)
      @sink_fund.apply_transactions_to_sink_fund_allocations(Transaction.where(id: transaction_ids))
      expect(@sink_fund.sink_fund_allocations.first.amount).to eq 3300_00
      expect(@sink_fund.sink_fund_allocations.second.amount).to eq 300_00
    end

  end

  describe ".adjust_balances" do

    it "does nothing if no bank_accounts exists"

    it "calls #adjust_balance for each bank account that exists"
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

  include_examples "CreditCard"

end
