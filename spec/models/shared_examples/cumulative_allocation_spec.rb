
shared_examples_for "CumulativeAllocation" do

  describe "#CumulativeAllocation" do
    before do
      @budget = create(:budget, start_date: Date.new(2019, 12, 25))
      @allocation = create(:allocation, budget: @budget, is_cumulative: true, amount: 6200)
    end

    it "has a flag that determines if allocation is cumulative or not" do
      @allocation = Allocation.new
      expect(@allocation.is_cumulative).to eq false

      allocation = Allocation.new is_cumulative: true
      expect(allocation.is_cumulative).to eq true
    end

    it "divides the the amount proportionally among the days of the month, even for the first week" do
      expect(@allocation.amount_for_week(1)).to eq 600
    end

    it "divides the the amount proportionally among the days of the month" do
      expect(@allocation.amount_for_week(2)).to eq 1400
    end

    it "handles fractions by rounding down" do
      allocation = create(:allocation, budget: @budget, is_cumulative: true, amount: 1000)
      expect(allocation.amount_for_week(2)).to eq 225
    end

    describe "#spent" do
      before do
        @week_one_transaction_1 = create(:transaction, allocation: @allocation, transaction_date: Date.new(2019, 12, 25), withdrawal_amount: 100, deposit_amount: 0)
        @week_one_transaction_2 = create(:transaction, allocation: @allocation, transaction_date: Date.new(2019, 12, 26), withdrawal_amount: 150, deposit_amount: 0)
        @week_one_transaction_3 = create(:transaction, allocation: @allocation, transaction_date: Date.new(2019, 12, 27), withdrawal_amount: 200, deposit_amount: 0)
        @week_two_transaction_1 = create(:transaction, allocation: @allocation, transaction_date: Date.new(2019, 12, 28), withdrawal_amount: 300, deposit_amount: 0)
        @week_two_transaction_2 = create(:transaction, allocation: @allocation, transaction_date: Date.new(2019, 12, 29), withdrawal_amount: 400, deposit_amount: 0)
      end

      it "sums transactions for week one" do
        expect(@allocation.spent_for_week(1)).to eq(450)
      end

      it "sums transactions for week two" do
        expect(@allocation.spent_for_week(2)).to eq(700)
      end

      it "sums transactions for week three" do
        expect(@allocation.spent_for_week(3)).to eq(0)
      end

      it "sums transactions for week four" do
        expect(@allocation.spent_for_week(4)).to eq(0)
      end
    end
  end
end

