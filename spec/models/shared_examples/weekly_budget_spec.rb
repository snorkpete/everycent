
shared_examples_for "Weekly" do

  describe "#WeeklyBudget" do
    before do
      @budget = create(:budget, start_date: Date.new(2019, 12, 25))
      @allocation = create(:allocation, budget: @budget, is_cumulative: true, amount: 6200)
      @budget
      @today = Date.new(2019, 12, 25).to_s
    end

    it "has a flag that determines if allocation is cumulative or not" do
      @allocation = Allocation.new
      expect(@allocation.is_cumulative).to eq false

      allocation = Allocation.new is_cumulative: true
      expect(allocation.is_cumulative).to eq true
    end

    it "divides the the amount proportionally among the days of the month"

    describe "#weeks when budget starts on Wed" do
      before do
        @budget = build(:budget, start_date: Date.new(2019, 12, 25), end_date: Date.new(2020, 1, 24))
      end

      it "counts week 1 as starting from budget start" do
        expect(@budget.start_date_for_week(1)).to eq Date.new(2019, 12, 25)
      end

      it "counts week 1 as ending on the first Friday after budget start" do
        expect(@budget.end_date_for_week(1)).to eq Date.new(2019, 12, 27)
      end

      it "has weighting of 3/31" do
        expect(@budget.weighting_for_week(1)).to eq 3/31
      end

      it "counts week 2 as starting from Saturday after budget start to following Friday" do
        expect(@budget.start_date_for_week(2)).to eq Date.new(2019, 12, 28)
      end

      it "counts week 2 as ending on Friday after the first Saturday" do
        expect(@budget.end_date_for_week(2)).to eq Date.new(2020, 1, 3)
      end

      it "counts week 3 as starting from 2nd Saturday after budget start" do
        expect(@budget.start_date_for_week(3)).to eq Date.new(2020, 1, 4)
      end

      it "counts week 3 as ending the Friday after the second saturday" do
        expect(@budget.end_date_for_week(3)).to eq Date.new(2020, 1, 10)
      end

      it "counts week 4 as starting from 3rd Saturday after budget start" do
        expect(@budget.start_date_for_week(4)).to eq Date.new(2020, 1, 11)
      end

      it "counts week 4 as ending the Friday after the 3rd saturday" do
        expect(@budget.end_date_for_week(4)).to eq Date.new(2020, 1, 17)
      end

      it "counts week 5 as starting from 4rd Saturday after budget start" do
        expect(@budget.start_date_for_week(5)).to eq Date.new(2020, 1, 18)
      end

      context "when budget ends on a friday" do
        it "counts week 5 as ending on the last friday" do
          expect(@budget.end_date_for_week(5)).to eq Date.new(2020, 1, 24)
        end
      end

      context "when budget starts on a saturday" do
        before do
          @january_budget = build(:budget, start_date: Date.new(2020, 1, 25), end_date: Date.new(2020, 2, 24))
        end

        it "counts week 1 as starting on budget start" do
          expect(@january_budget.start_date_for_week(1)).to eq Date.new(2020, 1, 25)
        end

        it "counts week 2 as starting on following Saturday" do
          expect(@january_budget.start_date_for_week(2)).to eq Date.new(2020, 2, 1)
        end

        it "counts week 5 as starting on 4th Saturday" do
          expect(@january_budget.start_date_for_week(5)).to eq Date.new(2020, 2, 22)
        end
      end

      context "when budget ends on another day besides friday" do
        before do
          @january_budget = build(:budget, start_date: Date.new(2020, 1, 25), end_date: Date.new(2020, 2, 24))
        end

        it "counts week 5 as ending on budget end" do
          expect(@january_budget.end_date_for_week(5)).to eq Date.new(2020, 2, 24)
        end
      end

    end
  end
end

