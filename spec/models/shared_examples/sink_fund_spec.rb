
shared_examples_for "SinkFund" do

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


  describe "#transfer_allocation" do
    before do
      @sink_fund = create(:bank_account, account_type: 'sink_fund',
                          closing_balance: 5000_00, closing_date: '2014-12-31')
      @from_allocation = create(:sink_fund_allocation, name: 'From',
                                amount: 2000_00, bank_account: @sink_fund)
      @to_allocation = create(:sink_fund_allocation, name: 'To',
                              amount: 1000_00, bank_account: @sink_fund)
    end

    it "creates a withdrawal transaction from the source allocation" do
      expect {
        @sink_fund.transfer_allocation(@from_allocation.id, @to_allocation.id, 500_00)
      }.to change { @sink_fund.transactions.count }.by(2)

      from_txn = @sink_fund.transactions.find_by(
        sink_fund_allocation_id: @from_allocation.id
      )
      expect(from_txn.withdrawal_amount).to eq 500_00
      expect(from_txn.deposit_amount).to eq 0
    end

    it "creates a deposit transaction to the target allocation" do
      @sink_fund.transfer_allocation(@from_allocation.id, @to_allocation.id, 500_00)

      to_txn = @sink_fund.transactions.find_by(
        sink_fund_allocation_id: @to_allocation.id
      )
      expect(to_txn.deposit_amount).to eq 500_00
      expect(to_txn.withdrawal_amount).to eq 0
    end

    it "does nothing when both allocation IDs are zero" do
      expect {
        @sink_fund.transfer_allocation(0, 0, 500_00)
      }.not_to change { @sink_fund.transactions.count }
    end

    it "sets the transaction description to 'Internal Allocation Transfer'" do
      @sink_fund.transfer_allocation(@from_allocation.id, @to_allocation.id, 500_00)
      expect(@sink_fund.transactions.last.description).to eq 'Internal Allocation Transfer'
    end

    it "sets the transaction status to 'paid'" do
      @sink_fund.transfer_allocation(@from_allocation.id, @to_allocation.id, 500_00)
      expect(@sink_fund.transactions.last.status).to eq 'paid'
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

end