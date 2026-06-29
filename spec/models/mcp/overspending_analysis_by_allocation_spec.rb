require 'rails_helper'

RSpec.describe Mcp::OverspendingAnalysisByAllocation, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  def build_query(period:, category: nil)
    Mcp::OverspendingAnalysisByAllocation.new(period: period, category: category)
  end

  describe 'validation' do
    it 'is valid with a YYYY-MM period' do
      expect(build_query(period: '2024-03')).to be_valid
    end

    it 'is invalid with a non-YYYY-MM period' do
      expect(build_query(period: 'bad')).not_to be_valid
    end
  end

  describe 'validation error message' do
    it 'is descriptive enough to guide a caller that passed a bad period' do
      query = build_query(period: 'bad')
      query.valid?
      expect(query.errors.full_messages.to_sentence).to eq('Period must be in YYYY-MM format, e.g. 2024-03')
    end
  end

  describe '#results' do
    let(:period) { '2024-02' }

    before do
      @category     = create(:allocation_category, budget_role: 'spending', name: 'Transport')
      @budget       = create_budget_period(month: '2024-02')
      @bank_account = create(:bank_account)
      @allocation   = create(
        :allocation,
        name:                'Car Insurance (Feb)',
        budget:              @budget,
        allocation_category: @category,
        amount:              30_000
      )
    end

    it 'returns rows with the expected keys' do
      row = build_query(period: period).results.first
      expect(row.keys).to match_array(
        %i[allocation category_id category
           budgeted_cents budgeted_display
           actual_cents actual_display
           amount_remaining_cents amount_remaining_display]
      )
    end

    it 'canonicalises allocation names (strips month suffix)' do
      row = build_query(period: period).results.first
      expect(row[:allocation]).to eq('Car Insurance')
    end

    it 'returns budgeted_cents from the allocation amount' do
      row = build_query(period: period).results.first
      expect(row[:budgeted_cents]).to eq(30_000)
      expect(row[:budgeted_display]).to eq('€300.00')
    end

    describe 'money display companions' do
      let(:rows) { build_query(period: period).results }

      include_examples "money fields have display companions"
    end

    it 'returns actual_cents from matching transactions' do
      create(
        :transaction,
        allocation:       @allocation,
        transaction_date: '2024-02-10',
        withdrawal_amount: 8_000,
        deposit_amount:    0
      )
      row = build_query(period: period).results.first
      expect(row[:actual_cents]).to eq(8_000)
    end

    it 'filters by category when provided' do
      other_category = create(:allocation_category, budget_role: 'spending', name: 'Food')
      create(:allocation, budget: @budget, allocation_category: other_category, amount: 10_000)

      rows = build_query(period: period, category: 'Transport').results
      expect(rows.map { |r| r[:category] }.uniq).to eq(['Transport'])
    end

    it 'returns rows from all categories when no category filter is provided' do
      other_category = create(:allocation_category, budget_role: 'spending', name: 'Food')
      create(:allocation, budget: @budget, allocation_category: other_category, amount: 10_000)

      category_names = build_query(period: period).results.map { |r| r[:category] }
      expect(category_names).to include('Transport', 'Food')
    end

    it 'excludes placeholder allocations (amount <= 10 cents) even with real spending against them' do
      placeholder_allocation = create(
        :allocation,
        name:                'Sink Fund Item (Feb)',
        budget:              @budget,
        allocation_category: @category,
        amount:              1
      )
      create(
        :transaction,
        allocation:        placeholder_allocation,
        transaction_date:  '2024-02-15',
        withdrawal_amount: 5_000,
        deposit_amount:    0
      )

      rows = build_query(period: period).results
      allocation_names = rows.map { |r| r[:allocation] }
      expect(allocation_names).not_to include('Sink Fund Item')
    end

    it 'raises when called on an invalid object' do
      expect { build_query(period: 'bad').results }.to raise_error(RuntimeError, /Call valid\?/)
    end

    describe 'boundary-crossing transaction (calendar month ≠ budget month)' do
      # The 2024-03 budget period spans Feb 25 – Mar 24.
      # A transaction dated 2024-02-26 has calendar month '2024-02' but budget month '2024-03'.
      # Old code keyed actuals by to_char(t.transaction_date,'YYYY-MM') so it would miss it.
      # New code keys by t.budget_id → correctly attributes it to the March period.
      #
      # Setup arithmetic:
      #   budgeted:  40_000 (€400.00)
      #   actual:    20_000 from the Feb-26 transaction (€200.00)
      #   remaining: 40_000 - 20_000 = 20_000 (€200.00)
      it 'counts a transaction dated in the prior calendar month when its budget period ends in the queried month' do
        budget_march = create_budget_period(month: '2024-03')
        cat          = create(:allocation_category, budget_role: 'spending', name: 'Boundary')
        alloc        = create(
          :allocation,
          name:                'Boundary Item (Mar)',
          budget:              budget_march,
          allocation_category: cat,
          amount:              40_000
        )
        # Feb 26 is calendar month '2024-02' but within the Feb 25–Mar 24 budget period
        create(
          :transaction,
          allocation:        alloc,
          transaction_date:  '2024-02-26',
          withdrawal_amount: 20_000,
          deposit_amount:    0
        )
        row = Mcp::OverspendingAnalysisByAllocation.new(period: '2024-03').results
                .find { |r| r[:allocation] == 'Boundary Item' }
        expect(row).not_to be_nil
        expect(row[:actual_cents]).to eq(20_000)
        expect(row[:amount_remaining_cents]).to eq(20_000)
      end
    end
  end
end
