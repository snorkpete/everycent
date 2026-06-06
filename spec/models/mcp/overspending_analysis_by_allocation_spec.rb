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
      @budget       = create(:budget, start_date: '2024-02-01')
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
        %i[allocation category_id category budgeted_cents actual_cents amount_remaining_cents]
      )
    end

    it 'canonicalises allocation names (strips month suffix)' do
      row = build_query(period: period).results.first
      expect(row[:allocation]).to eq('Car Insurance')
    end

    it 'returns budgeted_cents from the allocation amount' do
      row = build_query(period: period).results.first
      expect(row[:budgeted_cents]).to eq(30_000)
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
  end
end
