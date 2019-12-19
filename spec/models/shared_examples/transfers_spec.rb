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

shared_examples_for "Transfers" do

  describe "#transfer" do
    before do
      @from_account = create(:bank_account)
      @to_account = create(:bank_account)
    end

    describe "the 'from' transaction when transferring 500" do
      before do
        @today = Date.new(2018, 5, 25)
        @result = @from_account.transfer to: @to_account.id, amount: 500, description: 'money for rent', date: @today
        @from_transaction = @from_account.transactions.last
      end

      it "returns a success" do
        expect(@result[:success]).to be true
      end

      it "exists" do
        expect(@from_account.transactions.length).to eq 1
      end

      it "has a withdrawal amount of 500" do
        expect(@from_transaction.withdrawal_amount).to eq 500
      end

      it "has a deposit amount of 0" do
        expect(@from_transaction.deposit_amount).to eq 0
      end

      it "has a description of 'money for rent'" do
        expect(@from_transaction.description).to eq 'Withdrawal - money for rent'
      end

      it "has the date matching today" do
        expect(@from_transaction.transaction_date).to eq @today
      end

      it "has a status of paid" do
        expect(@from_transaction.status).to eq 'paid'
      end

      it "belongs to the correct household" do
        expect(@from_transaction.household_id).to eq @from_account.household_id
      end
    end


    describe "the 'to' transaction when transferring 200" do
      before do
        @today = Date.new(2018, 5, 30)
        @from_account.transfer to: @to_account.id, amount: 200, description: 'payback', date: @today
        @to_transaction = @to_account.transactions.last
      end

      it "exists" do
        expect(@to_account.transactions.length).to eq 1
      end

      it "has a withdrawal amount of 0" do
        expect(@to_transaction.withdrawal_amount).to eq 0
      end

      it "has a deposit amount of 200" do
        expect(@to_transaction.deposit_amount).to eq 200
      end

      it "has a description of 'money for rent'" do
        expect(@to_transaction.description).to eq 'Deposit - payback'
      end

      it "has the date matching today" do
        expect(@to_transaction.transaction_date).to eq @today
      end

      it "has a status of paid" do
        expect(@to_transaction.status).to eq 'paid'
      end

      it "belongs to the correct household" do
        expect(@to_transaction.household_id).to eq @from_account.household_id
      end
    end

    context "when includes allocation" do
      before do
        @today = Date.new(2018, 5, 30)
        @from_allocation = create(:allocation, name: 'From')
        @to_allocation = create(:allocation, name: 'To')
        @from_sink_fund_allocation = create(:sink_fund_allocation)
        @to_sink_fund_allocation = create(:sink_fund_allocation)
        @params = {
            to: @to_account.id,
            amount: 200,
            description: 'payback',
            date: @today,
        }
      end

      it "updates the allocation_id of the from transaction appropriately if provided" do
        @params[:from_allocation] = @from_allocation.id
        @from_account.transfer @params

        from_transaction = @from_account.transactions.last
        expect(from_transaction.allocation_id).to eq @from_allocation.id
      end

      it "ignores the allocation_id of the from transaction if not provided" do
        @params[:from_allocation] = nil
        @from_account.transfer @params

        from_transaction = @from_account.transactions.last
        expect(from_transaction.allocation_id).to be_nil
      end

      it "updates the sink_fund_allocation_id of the from transaction appropriately if provided" do
        @params[:from_sink_fund_allocation] = @from_sink_fund_allocation.id
        @from_account.transfer @params

        from_transaction = @from_account.transactions.last
        expect(from_transaction.sink_fund_allocation_id).to eq @from_sink_fund_allocation.id
      end

      it "ignores the sink_fund_allocation_id of the from transaction if not provided" do
        @params[:from_sink_fund_allocation] = nil
        @from_account.transfer @params

        from_transaction = @from_account.transactions.last
        expect(from_transaction.sink_fund_allocation_id).to be_nil
      end

      it "updates the allocation_id of the to transaction appropriately if provided" do
        @params[:to_allocation] = @to_allocation.id
        @from_account.transfer @params

        to_transaction = @to_account.transactions.last
        expect(to_transaction.allocation_id).to eq @to_allocation.id
      end

      it "ignores the allocation_id of the to transaction if not provided" do
        @params[:to_allocation] = nil
        @from_account.transfer @params

        to_transaction = @to_account.transactions.last
        expect(to_transaction.allocation_id).to be_nil
      end


      it "updates the sink_fund_allocation_id of the to transaction appropriately if provided" do
        @params[:to_sink_fund_allocation] = @to_sink_fund_allocation.id
        @from_account.transfer @params

        to_transaction = @to_account.transactions.last
        expect(to_transaction.sink_fund_allocation_id).to eq @to_sink_fund_allocation.id
      end

      it "ignores the sink_fund_allocation_id of the to transaction if not provided" do
        @params[:to_sink_fund_allocation] = nil
        @from_account.transfer @params

        to_transaction = @to_account.transactions.last
        expect(to_transaction.sink_fund_allocation_id).to be_nil
      end
    end

    context "when invalid" do
      it "returns an error if we don't have a valid 'to' parameter" do
        result = @from_account.transfer to: 5000, amount: 300, description: 'Test'
        expect(result[:success]).to eq false
        expect(result[:reason]).to eq "To account doesn't exist"
      end

      it "returns an error if we don't have an amount" do
        result = @from_account.transfer to: @to_account.id, amount: 0, description: 'Test'
        expect(result[:success]).to eq false
        expect(result[:reason]).to eq "Amount must be greater than 0"
      end

      it "returns an error if we have a negative amount" do
        result = @from_account.transfer to: @to_account.id, amount: -100, description: 'Test'
        expect(result[:success]).to eq false
        expect(result[:reason]).to eq "Amount must be greater than 0"
      end

      it "returns an error if we don't have a description" do
        result = @from_account.transfer to: @to_account.id, amount: 100, description: nil
        expect(result[:success]).to eq false
        expect(result[:reason]).to eq "Description can't be blank"
      end

      it "returns an error if we have a blank description" do
        result = @from_account.transfer to: @to_account.id, amount: 100, description: ''
        expect(result[:success]).to eq false
        expect(result[:reason]).to eq "Description can't be blank"
      end

      it "doesn't allow both from sink fund allocation and from allocation at the same time" do
        @from_allocation = create(:allocation, name: 'From')
        @to_allocation = create(:allocation, name: 'To')
        @from_sink_fund_allocation = create(:sink_fund_allocation)
        @to_sink_fund_allocation = create(:sink_fund_allocation)

        result = @from_account.transfer to: @to_account, amount: 100, description: 'anything',
                                        from_allocation: @from_allocation.id,
                                        from_sink_fund_allocation: @from_sink_fund_allocation.id
        expect(result[:success]).to eq false
        expect(result[:reason]).to eq "Can only transfer from EITHER an allocation OR a sink fund allocation, not both"
      end

      it "doesn't allow both to sink fund allocation and to allocation at the same time" do
        @from_allocation = create(:allocation, name: 'From')
        @to_allocation = create(:allocation, name: 'To')
        @from_sink_fund_allocation = create(:sink_fund_allocation)
        @to_sink_fund_allocation = create(:sink_fund_allocation)

        result = @from_account.transfer to: @to_account, amount: 100, description: 'anything',
                                        to_allocation: @to_allocation.id,
                                        to_sink_fund_allocation: @to_sink_fund_allocation.id
        expect(result[:success]).to eq false
        expect(result[:reason]).to eq "Can only transfer to EITHER an allocation OR a sink fund allocation, not both"
      end
    end
  end


end

