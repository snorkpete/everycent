require 'core_extensions/date_extensions/relative_date.rb'

describe "CoreExtensions::DateExtensions::RelativeDate" do
  before :all do
    Date.include CoreExtensions::DateExtensions::RelativeDate
  end

  describe "#previous_date_for_day_of_month" do

    context "when day_of_month < self.day" do
      it "returns the day_of_month in the current month" do
        expect(Date.new(2015,10,20).previous_date_for_day_of_month(10)).to eq Date.new(2015, 10, 10)
      end
    end

    context "when self.day == day_of_month" do
      it "#returns the day_of_month in the previous month" do
        expect(Date.new(2015,12,10).previous_date_for_day_of_month(10)).to eq Date.new(2015, 11, 10)
      end
    end

    context "when self.day < day_of_month" do
      it "returns the day_of_month in the previous month" do
        expect(Date.new(2015,1,1).previous_date_for_day_of_month(10)).to eq Date.new(2014, 12, 10)
      end
    end

    context "when the previous month doesn't have the day_in_month" do
      it "returns the last day of the previous month" do
        expect(Date.new(2015,3,15).previous_date_for_day_of_month(30)).to eq Date.new(2015, 2, 28)
      end
    end
  end # end #previous_date_for_day_of_month

  describe "#next_date_for_day_of_month" do

    context "when day_of_month < self.day" do
      it "returns the day_of_month in the next month" do
        expect(Date.new(2015,10,20).next_date_for_day_of_month(15)).to eq Date.new(2015, 11, 15)
      end
    end

    context "when self.day == day_of_month" do
      it "returns the day_of_month in the next month" do
        expect(Date.new(2015,12,10).next_date_for_day_of_month(10)).to eq Date.new(2016, 1, 10)
      end
    end

    context "when self.day < day_of_month" do
      it "returns the day_of_month in the current month" do
        expect(Date.new(2015,1,1).next_date_for_day_of_month(10)).to eq Date.new(2015, 1, 10)
      end
    end

    context "when the current month doesn't have the day_in_month" do
      it "returns the last day of the current month" do
        expect(Date.new(2015,6,15).next_date_for_day_of_month(31)).to eq Date.new(2015, 6, 30)
      end
    end
  end
end
