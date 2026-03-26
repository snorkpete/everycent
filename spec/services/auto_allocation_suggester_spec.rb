require 'rails_helper'

RSpec.describe AutoAllocationSuggester do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  let(:allocation_category) { create(:allocation_category) }
  let(:normal_bank_account) { create(:bank_account, account_type: "normal") }
  let(:sink_fund_account) { create(:bank_account, account_type: "sink_fund") }

  let(:previous_budget) { create(:budget, start_date: "2025-01-01") }
  let(:current_budget) { create(:budget, start_date: "2025-02-01") }

  let!(:prev_groceries) do
    create(:allocation,
      budget: previous_budget,
      allocation_category: allocation_category,
      name: "Groceries",
      bank_account: normal_bank_account
    )
  end

  let!(:current_groceries) do
    create(:allocation,
      budget: current_budget,
      allocation_category: allocation_category,
      name: "Groceries",
      bank_account: normal_bank_account
    )
  end

  def create_prev_transaction(description:, allocation:, bank_account: nil, date: "2025-01-15")
    create(:transaction,
      bank_account: bank_account || normal_bank_account,
      allocation: allocation,
      description: description,
      transaction_date: date,
      withdrawal_amount: 100,
      deposit_amount: 0
    )
  end

  describe "#call" do
    context "with no descriptions" do
      it "returns an empty array" do
        result = described_class.new(budget: current_budget, descriptions: []).call
        expect(result).to eq([])
      end
    end

    context "with no previous budget" do
      it "returns all nils" do
        first_budget = create(:budget, start_date: "2020-01-01")
        result = described_class.new(budget: first_budget, descriptions: ["AH Supermarket"]).call
        expect(result).to eq([nil])
      end
    end

    context "exact match" do
      it "matches case-insensitively on full description" do
        create_prev_transaction(description: "AH Supermarket", allocation: prev_groceries)

        result = described_class.new(budget: current_budget, descriptions: ["ah supermarket"]).call

        expect(result.size).to eq(1)
        expect(result[0][:allocation_id]).to eq(current_groceries.id)
        expect(result[0][:allocation_name]).to eq("Groceries")
        expect(result[0][:match_type]).to eq("exact")
      end
    end

    context "contains match" do
      it "matches when input description contains previous transaction description" do
        create_prev_transaction(description: "AH Supermarket", allocation: prev_groceries)

        result = described_class.new(budget: current_budget, descriptions: ["AH Supermarket Amsterdam"]).call

        expect(result.size).to eq(1)
        expect(result[0][:allocation_id]).to eq(current_groceries.id)
        expect(result[0][:match_type]).to eq("contains")
      end

      it "does not match short fragments (less than 3 chars)" do
        create_prev_transaction(description: "AH", allocation: prev_groceries)

        result = described_class.new(budget: current_budget, descriptions: ["AH Supermarket"]).call

        expect(result).to eq([nil])
      end
    end

    context "no match" do
      it "returns nil when description does not match any previous transaction" do
        create_prev_transaction(description: "AH Supermarket", allocation: prev_groceries)

        result = described_class.new(budget: current_budget, descriptions: ["Netflix"]).call

        expect(result).to eq([nil])
      end
    end

    context "ambiguous match" do
      it "returns nil when matching transactions point to different allocations" do
        prev_dining = create(:allocation,
          budget: previous_budget,
          allocation_category: allocation_category,
          name: "Dining",
          bank_account: normal_bank_account
        )

        create_prev_transaction(description: "Restaurant XYZ", allocation: prev_groceries)
        create_prev_transaction(description: "Restaurant XYZ", allocation: prev_dining)

        result = described_class.new(budget: current_budget, descriptions: ["Restaurant XYZ"]).call

        expect(result).to eq([nil])
      end
    end

    context "sink fund filtering" do
      it "ignores transactions from sink fund bank accounts" do
        create_prev_transaction(description: "AH Supermarket", allocation: prev_groceries, bank_account: sink_fund_account)

        result = described_class.new(budget: current_budget, descriptions: ["AH Supermarket"]).call

        expect(result).to eq([nil])
      end

      it "does not suggest allocations linked to sink fund bank accounts" do
        create(:allocation,
          budget: current_budget,
          allocation_category: allocation_category,
          name: "Savings Goal",
          bank_account: sink_fund_account,
          is_standing_order: true
        )

        prev_savings = create(:allocation,
          budget: previous_budget,
          allocation_category: allocation_category,
          name: "Savings Goal",
          bank_account: normal_bank_account
        )

        create_prev_transaction(description: "Transfer savings", allocation: prev_savings)

        result = described_class.new(budget: current_budget, descriptions: ["Transfer savings"]).call

        expect(result).to eq([nil])
      end
    end

    context "positional output" do
      it "returns suggestions matching input array by index" do
        prev_transport = create(:allocation,
          budget: previous_budget,
          allocation_category: allocation_category,
          name: "Transport",
          bank_account: normal_bank_account
        )

        create(:allocation,
          budget: current_budget,
          allocation_category: allocation_category,
          name: "Transport",
          bank_account: normal_bank_account
        )

        create_prev_transaction(description: "AH Supermarket", allocation: prev_groceries)
        create_prev_transaction(description: "NS Train", allocation: prev_transport)

        descriptions = ["AH Supermarket", "Unknown Store", "NS Train"]
        result = described_class.new(budget: current_budget, descriptions: descriptions).call

        expect(result.size).to eq(3)
        expect(result[0][:allocation_name]).to eq("Groceries")
        expect(result[1]).to be_nil
        expect(result[2][:allocation_name]).to eq("Transport")
      end
    end

    context "allocation not in current budget" do
      it "returns nil when previous allocation name does not exist in current budget" do
        prev_misc = create(:allocation,
          budget: previous_budget,
          allocation_category: allocation_category,
          name: "Miscellaneous",
          bank_account: normal_bank_account
        )

        create_prev_transaction(description: "Random Store", allocation: prev_misc)

        result = described_class.new(budget: current_budget, descriptions: ["Random Store"]).call

        expect(result).to eq([nil])
      end
    end

    context "exact match takes priority over contains" do
      it "uses exact match even when contains would also match" do
        prev_transport = create(:allocation,
          budget: previous_budget,
          allocation_category: allocation_category,
          name: "Transport",
          bank_account: normal_bank_account
        )

        create(:allocation,
          budget: current_budget,
          allocation_category: allocation_category,
          name: "Transport",
          bank_account: normal_bank_account
        )

        create_prev_transaction(description: "NS Train", allocation: prev_groceries)
        create_prev_transaction(description: "NS Train Ticket", allocation: prev_transport)

        # "NS Train" should exact-match the first transaction -> Groceries
        result = described_class.new(budget: current_budget, descriptions: ["NS Train"]).call

        expect(result[0][:allocation_id]).to eq(current_groceries.id)
        expect(result[0][:match_type]).to eq("exact")
      end
    end

    context "previous budget selection" do
      it "uses the immediately preceding budget, not an older one" do
        older_budget = create(:budget, start_date: "2024-12-01")

        older_allocation = create(:allocation,
          budget: older_budget,
          allocation_category: allocation_category,
          name: "Groceries",
          bank_account: normal_bank_account
        )

        # Transaction in older budget - should NOT be used
        create_prev_transaction(description: "Lidl", allocation: older_allocation, date: "2024-12-15")

        # Transaction in previous budget (Jan) - should be used
        create_prev_transaction(description: "AH Supermarket", allocation: prev_groceries, date: "2025-01-15")

        result = described_class.new(budget: current_budget, descriptions: ["Lidl", "AH Supermarket"]).call

        # Lidl only exists in the older budget, not the previous one
        expect(result[0]).to be_nil
        expect(result[1][:allocation_id]).to eq(current_groceries.id)
      end
    end
  end
end
