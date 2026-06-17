require 'rails_helper'

RSpec.describe Mcp::PlaceholderAllocationAnalysis, type: :model do
  before do
    @household    = create(:household)
    ActsAsTenant.current_tenant = @household
    @bank_account = create(:bank_account)
    @category     = create(:allocation_category, budget_role: 'spending', name: 'Food')
  end

  def build_query(**overrides)
    defaults = { start_month: '2024-01', end_month: '2024-03' }
    Mcp::PlaceholderAllocationAnalysis.new(**defaults.merge(overrides))
  end

  # Helper: create a budget + allocation, optionally with a transaction
  def setup_month(month:, budgeted:, actual: nil, allocation_name: 'Test Item', category: nil)
    cat = category || @category
    budget = create(:budget, start_date: "#{month}-01")
    allocation = create(
      :allocation,
      name:                allocation_name,
      budget:              budget,
      allocation_category: cat,
      amount:              budgeted
    )
    if actual
      create(
        :transaction,
        allocation:       allocation,
        transaction_date: "#{month}-15",
        withdrawal_amount: actual,
        deposit_amount:    0
      )
    end
    { budget: budget, allocation: allocation }
  end

  # ─── Validations ─────────────────────────────────────────────────────────────

  describe 'validations' do
    describe 'start_month' do
      it 'is valid with YYYY-MM format' do
        expect(build_query(start_month: '2024-01')).to be_valid
      end

      it 'is invalid when not YYYY-MM format' do
        q = build_query(start_month: 'bad')
        expect(q).not_to be_valid
        expect(q.errors.full_messages.to_sentence).to include('start_month must be in YYYY-MM format')
      end
    end

    describe 'end_month' do
      it 'is valid with YYYY-MM format' do
        expect(build_query(end_month: '2024-03')).to be_valid
      end

      it 'is invalid when not YYYY-MM format' do
        q = build_query(end_month: 'bad')
        expect(q).not_to be_valid
        expect(q.errors.full_messages.to_sentence).to include('end_month must be in YYYY-MM format')
      end
    end

    describe 'end_month before start_month' do
      it 'is invalid when end_month is before start_month' do
        q = build_query(start_month: '2024-06', end_month: '2024-01')
        expect(q).not_to be_valid
        expect(q.errors.full_messages.to_sentence).to include(
          'end_month (2024-01) must not be before start_month (2024-06)'
        )
      end

      it 'is valid when end_month equals start_month' do
        expect(build_query(start_month: '2024-03', end_month: '2024-03')).to be_valid
      end
    end
  end

  # ─── Results structure ────────────────────────────────────────────────────────

  describe '#results' do
    it 'raises when called on an invalid object' do
      expect { build_query(start_month: 'bad').results }.to raise_error(RuntimeError, /Call valid\?/)
    end

    it 'returns a hash with monthly_summary and top_placeholders keys' do
      setup_month(month: '2024-01', budgeted: 1, actual: 5_000)
      result = build_query.results
      expect(result.keys).to contain_exactly(:monthly_summary, :top_placeholders)
    end

    # ─── monthly_summary ──────────────────────────────────────────────────────

    describe 'monthly_summary' do
      context 'with one placeholder allocation' do
        before do
          # Regular allocation (excluded from placeholder count)
          setup_month(month: '2024-01', budgeted: 50_000, actual: 48_000, allocation_name: 'Rent')
          # Placeholder allocation (budgeted = 1 cent — within PLACEHOLDER_MAX_CENTS)
          setup_month(month: '2024-01', budgeted: 1, actual: 15_000, allocation_name: 'Sink Fund Item')
        end

        it 'returns rows with expected keys' do
          row = build_query.results[:monthly_summary].first
          expect(row.keys).to match_array(
            %i[month total_allocation_count placeholder_count
               placeholder_pct spend_cents spend_display]
          )
        end

        it 'counts all allocations in total_allocation_count' do
          row = build_query.results[:monthly_summary].find { |r| r[:month] == '2024-01' }
          expect(row[:total_allocation_count]).to eq(2)
        end

        it 'counts only placeholder allocations in placeholder_count' do
          row = build_query.results[:monthly_summary].find { |r| r[:month] == '2024-01' }
          expect(row[:placeholder_count]).to eq(1)
        end

        it 'computes placeholder_pct correctly' do
          row = build_query.results[:monthly_summary].find { |r| r[:month] == '2024-01' }
          # 1 of 2 allocations = 50.0%
          expect(row[:placeholder_pct]).to be_within(0.1).of(50.0)
        end

        it 'sums spending through placeholder allocations only' do
          row = build_query.results[:monthly_summary].find { |r| r[:month] == '2024-01' }
          expect(row[:spend_cents]).to eq(15_000)
        end

        it 'returns spend_display as a formatted currency string' do
          row = build_query.results[:monthly_summary].find { |r| r[:month] == '2024-01' }
          expect(row[:spend_display]).to eq(Mcp::Money.display(15_000))
        end
      end

      it 'is sorted chronologically (ASC)' do
        setup_month(month: '2024-01', budgeted: 1, actual: nil)
        setup_month(month: '2024-03', budgeted: 1, actual: nil)
        months = build_query.results[:monthly_summary].map { |r| r[:month] }
        expect(months).to eq(months.sort)
      end

      it 'treats amount = 10 cents as a placeholder (boundary: PLACEHOLDER_MAX_CENTS = 10)' do
        setup_month(month: '2024-01', budgeted: 10, actual: 5_000)
        row = build_query.results[:monthly_summary].first
        expect(row[:placeholder_count]).to eq(1)
        expect(row[:spend_cents]).to eq(5_000)
      end

      it 'treats amount = 11 cents as NOT a placeholder (above threshold)' do
        setup_month(month: '2024-01', budgeted: 11, actual: 5_000)
        row = build_query.results[:monthly_summary].first
        expect(row[:placeholder_count]).to eq(0)
        expect(row[:spend_cents]).to eq(0)
      end
    end

    # ─── top_placeholders ─────────────────────────────────────────────────────

    describe 'top_placeholders' do
      before do
        setup_month(month: '2024-01', budgeted: 1, actual: 10_000, allocation_name: 'Dentist')
        setup_month(month: '2024-02', budgeted: 1, actual: 10_000, allocation_name: 'Dentist')
        setup_month(month: '2024-01', budgeted: 1, actual: 5_000, allocation_name: 'Car Service')
      end

      it 'returns rows with expected keys' do
        row = build_query.results[:top_placeholders].first
        expect(row.keys).to match_array(
          %i[allocation_name category_name months_appeared
             total_spend_cents total_spend_display]
        )
      end

      it 'groups across months and sums spend' do
        row = build_query.results[:top_placeholders].find { |r| r[:allocation_name] == 'Dentist' }
        expect(row[:total_spend_cents]).to eq(20_000)
        expect(row[:months_appeared]).to eq(2)
      end

      it 'is sorted by total_spend_cents DESC' do
        results = build_query.results[:top_placeholders]
        totals = results.map { |r| r[:total_spend_cents] }
        expect(totals).to eq(totals.sort.reverse)
      end

      it 'does not include non-placeholder allocations' do
        setup_month(month: '2024-01', budgeted: 50_000, actual: 60_000, allocation_name: 'Rent')
        results = build_query.results[:top_placeholders]
        expect(results.map { |r| r[:allocation_name] }).not_to include('Rent')
      end
    end

    # ─── Bookkeeping gates ────────────────────────────────────────────────────

    context 'bookkeeping gates' do
      before do
        result = setup_month(month: '2024-01', budgeted: 1, actual: nil)
        @allocation = result[:allocation]
      end

      it 'excludes brought-forward transactions from spend count' do
        create(
          :transaction,
          allocation:             @allocation,
          transaction_date:       '2024-01-15',
          withdrawal_amount:       10_000,
          deposit_amount:          0,
          brought_forward_status: 'added'
        )
        row = build_query.results[:monthly_summary].first
        expect(row[:spend_cents]).to eq(0)
      end

      it 'excludes manual adjustment transactions from spend count' do
        create(
          :transaction,
          allocation:          @allocation,
          transaction_date:    '2024-01-15',
          withdrawal_amount:    10_000,
          deposit_amount:       0,
          is_manual_adjustment: true
        )
        row = build_query.results[:monthly_summary].first
        expect(row[:spend_cents]).to eq(0)
      end
    end

    # ─── Money display companions ─────────────────────────────────────────────

    context 'money display companions (monthly_summary)' do
      before { setup_month(month: '2024-01', budgeted: 1, actual: 5_000) }

      describe 'money fields have display companions' do
        let(:rows) { build_query.results[:monthly_summary] }

        include_examples "money fields have display companions"
      end
    end

    context 'money display companions (top_placeholders)' do
      before { setup_month(month: '2024-01', budgeted: 1, actual: 5_000) }

      describe 'money fields have display companions' do
        let(:rows) { build_query.results[:top_placeholders] }

        include_examples "money fields have display companions"
      end
    end

    # ─── Cross-tenant isolation ───────────────────────────────────────────────

    it 'does not inflate total_allocation_count with another household\'s allocations in the same month' do
      # Set up allocations for household A (current tenant)
      setup_month(month: '2024-01', budgeted: 50_000, allocation_name: 'Rent')
      setup_month(month: '2024-01', budgeted: 1,      allocation_name: 'Sink Fund Item')

      # Set up allocations for household B in the same month
      other_household = create(:household)
      ActsAsTenant.with_tenant(other_household) do
        other_category = create(:allocation_category, budget_role: 'spending', name: 'Bills')
        other_budget = create(:budget, start_date: '2024-01-01')
        create(:allocation, budget: other_budget, allocation_category: other_category,
               name: 'Water', amount: 30_000)
        create(:allocation, budget: other_budget, allocation_category: other_category,
               name: 'Electric', amount: 25_000)
      end

      row = build_query(start_month: '2024-01', end_month: '2024-01').results[:monthly_summary].first
      # Household A has 2 allocations — household B's 2 must not be counted
      expect(row[:total_allocation_count]).to eq(2)
    end

    # ─── Tenant scoping ───────────────────────────────────────────────────────

    it 'scopes to the current tenant — a different household sees no data' do
      setup_month(month: '2024-01', budgeted: 1, actual: 5_000)

      other_household = create(:household)
      ActsAsTenant.current_tenant = other_household
      result = build_query.results
      expect(result[:monthly_summary]).to be_empty
      expect(result[:top_placeholders]).to be_empty
    ensure
      ActsAsTenant.current_tenant = @household
    end

    # ─── Date range ───────────────────────────────────────────────────────────

    it 'only includes budget months within the start_month/end_month range' do
      setup_month(month: '2023-12', budgeted: 1, actual: 5_000) # outside
      setup_month(month: '2024-01', budgeted: 1, actual: 8_000) # inside
      setup_month(month: '2024-04', budgeted: 1, actual: 3_000) # outside

      months = build_query(
        start_month: '2024-01', end_month: '2024-01'
      ).results[:monthly_summary].map { |r| r[:month] }
      expect(months).to eq(['2024-01'])
    end
  end
end
