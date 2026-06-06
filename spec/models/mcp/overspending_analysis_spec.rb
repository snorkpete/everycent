require 'rails_helper'

RSpec.describe Mcp::OverspendingAnalysis, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  def build_query(period:)
    Mcp::OverspendingAnalysis.new(period: period)
  end

  describe 'validation' do
    it 'is valid with a YYYY-MM period' do
      expect(build_query(period: '2024-03')).to be_valid
    end

    it 'is invalid when period is missing the day separator' do
      expect(build_query(period: '202403')).not_to be_valid
    end

    it 'is invalid with a full date' do
      expect(build_query(period: '2024-03-01')).not_to be_valid
    end

    it 'is invalid with free text' do
      expect(build_query(period: 'March 2024')).not_to be_valid
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
    let(:period) { '2024-01' }

    before do
      @category = create(:allocation_category, budget_role: 'spending', name: 'Groceries')
      @budget   = create(:budget, start_date: '2024-01-01')
      @bank_account = create(:bank_account)
      @allocation = create(
        :allocation,
        budget:              @budget,
        allocation_category: @category,
        amount:              50_000
      )
    end

    it 'scopes to the current tenant — a different household sees no data' do
      other_household = create(:household)
      ActsAsTenant.current_tenant = other_household
      expect(Mcp::OverspendingAnalysis.new(period: period).results).to eq([])
    ensure
      ActsAsTenant.current_tenant = @household
    end

    it 'returns a row per spending category with the expected keys' do
      row = build_query(period: period).results.first
      expect(row.keys).to match_array(%i[category budgeted_cents actual_cents amount_remaining_cents])
    end

    it 'returns budgeted_cents from allocation amounts' do
      row = build_query(period: period).results.find { |r| r[:category] == 'Groceries' }
      expect(row[:budgeted_cents]).to eq(50_000)
    end

    it 'returns actual_cents from matching transactions' do
      create(
        :transaction,
        allocation:       @allocation,
        transaction_date: '2024-01-15',
        withdrawal_amount: 12_000,
        deposit_amount:    0
      )
      row = build_query(period: period).results.find { |r| r[:category] == 'Groceries' }
      expect(row[:actual_cents]).to eq(12_000)
    end

    it 'excludes transactions with brought_forward_status of added' do
      create(
        :transaction,
        allocation:             @allocation,
        transaction_date:       '2024-01-15',
        withdrawal_amount:       5_000,
        deposit_amount:          0,
        brought_forward_status: 'added'
      )
      row = build_query(period: period).results.find { |r| r[:category] == 'Groceries' }
      expect(row[:actual_cents]).to eq(0)
    end

    it 'excludes manual adjustment transactions' do
      create(
        :transaction,
        allocation:          @allocation,
        transaction_date:    '2024-01-15',
        withdrawal_amount:    5_000,
        deposit_amount:       0,
        is_manual_adjustment: true
      )
      row = build_query(period: period).results.find { |r| r[:category] == 'Groceries' }
      expect(row[:actual_cents]).to eq(0)
    end

    it 'excludes non-spending categories' do
      savings_category = create(:allocation_category, budget_role: 'savings', name: 'Rainy Day')
      savings_allocation = create(
        :allocation,
        budget:              @budget,
        allocation_category: savings_category,
        amount:              20_000
      )
      create(
        :transaction,
        allocation:       savings_allocation,
        transaction_date: '2024-01-15',
        withdrawal_amount: 5_000,
        deposit_amount:    0
      )

      category_names = build_query(period: period).results.map { |r| r[:category] }
      expect(category_names).not_to include('Rainy Day')
    end

    it 'raises when called on an invalid object' do
      expect { build_query(period: 'bad').results }.to raise_error(RuntimeError, /Call valid\?/)
    end
  end
end
