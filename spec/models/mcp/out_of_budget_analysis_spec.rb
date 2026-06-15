require 'rails_helper'

RSpec.describe Mcp::OutOfBudgetAnalysis, type: :model do
  before do
    @household    = create(:household)
    ActsAsTenant.current_tenant = @household
    @bank_account = create(:bank_account)

    # OOB category — matches OOB_CATEGORY_NAMES[0]
    @oob_category = create(
      :allocation_category,
      budget_role: 'spending',
      name: 'Out-of-Budget/ Sink Fund Transfers'
    )
    # Supplement category — matches OOB_CATEGORY_NAMES[1]
    @supplement_category = create(
      :allocation_category,
      budget_role: 'spending',
      name: 'Over Budget Supplement'
    )
    # Regular spending category — must NOT appear in OOB results
    @regular_category = create(
      :allocation_category,
      budget_role: 'spending',
      name: 'Groceries'
    )
  end

  def build_query(**overrides)
    defaults = { start_month: '2024-01', end_month: '2024-03' }
    Mcp::OutOfBudgetAnalysis.new(**defaults.merge(overrides))
  end

  # Helper: create a budget + OOB allocation + optional transaction
  def setup_oob_month(month:, category: nil, allocation_name: 'Trip Expenses', actual: nil)
    cat = category || @oob_category
    budget = create(:budget, start_date: "#{month}-01")
    allocation = create(
      :allocation,
      name:                allocation_name,
      budget:              budget,
      allocation_category: cat,
      amount:              500
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

      it 'is invalid with a full date' do
        expect(build_query(start_month: '2024-01-01')).not_to be_valid
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

    describe 'group_by' do
      it 'is valid with "month"' do
        expect(build_query(group_by: 'month')).to be_valid
      end

      it 'is valid with "allocation_name"' do
        expect(build_query(group_by: 'allocation_name')).to be_valid
      end

      it 'is valid with "calendar_month"' do
        expect(build_query(group_by: 'calendar_month')).to be_valid
      end

      it 'is invalid with an unrecognised value' do
        q = build_query(group_by: 'category')
        expect(q).not_to be_valid
        expect(q.errors.full_messages.to_sentence).to include(
          'group_by must be one of: month, allocation_name, calendar_month'
        )
      end
    end
  end

  # ─── Results: raises on invalid ──────────────────────────────────────────────

  describe '#results' do
    it 'raises when called on an invalid object' do
      expect { build_query(start_month: 'bad').results }.to raise_error(RuntimeError, /Call valid\?/)
    end

    # ─── group_by: month ──────────────────────────────────────────────────────

    context 'group_by: month' do
      before { setup_oob_month(month: '2024-01', actual: 10_000) }

      it 'returns a row with expected keys' do
        row = build_query(group_by: 'month').results.first
        expect(row.keys).to match_array(%i[month total_cents total_display])
      end

      it 'returns the correct month label' do
        row = build_query(group_by: 'month').results.first
        expect(row[:month]).to eq('2024-01')
      end

      it 'returns the correct total_cents' do
        row = build_query(group_by: 'month').results.first
        expect(row[:total_cents]).to eq(10_000)
      end

      it 'returns total_display as a formatted currency string' do
        row = build_query(group_by: 'month').results.first
        expect(row[:total_display]).to eq(Mcp::Money.display(10_000))
      end

      it 'is sorted chronologically (ASC)' do
        setup_oob_month(month: '2024-02', actual: 5_000)
        setup_oob_month(month: '2024-03', actual: 8_000)
        months = build_query(group_by: 'month').results.map { |r| r[:month] }
        expect(months).to eq(months.sort)
      end
    end

    # ─── group_by: allocation_name ────────────────────────────────────────────

    context 'group_by: allocation_name' do
      before do
        setup_oob_month(month: '2024-01', allocation_name: 'Car Repair', actual: 20_000)
        setup_oob_month(month: '2024-02', allocation_name: 'Car Repair', actual: 15_000)
        setup_oob_month(month: '2024-01', allocation_name: 'Dentist', actual: 5_000)
      end

      it 'returns a row with expected keys' do
        row = build_query(group_by: 'allocation_name').results.first
        expect(row.keys).to match_array(%i[allocation_name total_cents total_display])
      end

      it 'groups by allocation name and sums spend' do
        results = build_query(group_by: 'allocation_name').results
        car_row = results.find { |r| r[:allocation_name] == 'Car Repair' }
        expect(car_row[:total_cents]).to eq(35_000)
      end

      it 'is sorted by total_cents DESC (highest spend first)' do
        results = build_query(group_by: 'allocation_name').results
        totals = results.map { |r| r[:total_cents] }
        expect(totals).to eq(totals.sort.reverse)
      end

      it 'merges month-suffix variants of the same allocation' do
        setup_oob_month(month: '2024-03', allocation_name: 'Car Insurance (Jan)', actual: 8_000)
        setup_oob_month(month: '2024-01', allocation_name: 'Car Insurance (Feb)', actual: 8_000)
        results = build_query(group_by: 'allocation_name').results
        labels = results.map { |r| r[:allocation_name] }
        expect(labels.count { |l| l == 'Car Insurance' }).to eq(1)
      end
    end

    # ─── group_by: calendar_month ─────────────────────────────────────────────

    context 'group_by: calendar_month' do
      before do
        # Jan 2024: 10_000; Jan 2025: 20_000 — avg = 15_000
        setup_oob_month(month: '2024-01', actual: 10_000)
        setup_oob_month(month: '2025-01', actual: 20_000)
        # Feb 2024: 5_000 — avg = 5_000
        setup_oob_month(month: '2024-02', actual: 5_000)
      end

      it 'returns rows with expected keys' do
        row = build_query(
          start_month: '2024-01', end_month: '2025-12', group_by: 'calendar_month'
        ).results.first
        expect(row.keys).to match_array(
          %i[calendar_month month_name year_count
             total_cents total_display avg_monthly_cents avg_monthly_display]
        )
      end

      it 'averages spend across years for a given calendar month' do
        results = build_query(
          start_month: '2024-01', end_month: '2025-12', group_by: 'calendar_month'
        ).results
        jan_row = results.find { |r| r[:calendar_month] == 1 }
        expect(jan_row[:year_count]).to eq(2)
        expect(jan_row[:avg_monthly_cents]).to be_within(1).of(15_000)
      end

      it 'is sorted by avg_monthly_cents DESC (worst months first)' do
        results = build_query(
          start_month: '2024-01', end_month: '2025-12', group_by: 'calendar_month'
        ).results
        avgs = results.map { |r| r[:avg_monthly_cents] }
        expect(avgs).to eq(avgs.sort.reverse)
      end
    end

    # ─── Bookkeeping gates ────────────────────────────────────────────────────

    context 'bookkeeping gates' do
      before do
        @result = setup_oob_month(month: '2024-01', actual: nil)
        @budget     = @result[:budget]
        @allocation = @result[:allocation]
      end

      it 'excludes brought-forward transactions' do
        create(
          :transaction,
          allocation:             @allocation,
          transaction_date:       '2024-01-15',
          withdrawal_amount:       10_000,
          deposit_amount:          0,
          brought_forward_status: 'added'
        )
        rows = build_query(group_by: 'month').results
        expect(rows).to be_empty
      end

      it 'excludes adjustment brought-forward transactions' do
        create(
          :transaction,
          allocation:             @allocation,
          transaction_date:       '2024-01-15',
          withdrawal_amount:       10_000,
          deposit_amount:          0,
          brought_forward_status: 'adjustment'
        )
        rows = build_query(group_by: 'month').results
        expect(rows).to be_empty
      end

      it 'excludes manual adjustments' do
        create(
          :transaction,
          allocation:          @allocation,
          transaction_date:    '2024-01-15',
          withdrawal_amount:    10_000,
          deposit_amount:       0,
          is_manual_adjustment: true
        )
        rows = build_query(group_by: 'month').results
        expect(rows).to be_empty
      end

      it 'excludes regular spending categories (only OOB categories appear)' do
        regular_budget = create(:budget, start_date: '2024-01-01')
        regular_alloc = create(
          :allocation,
          budget:              regular_budget,
          allocation_category: @regular_category,
          amount:              50_000
        )
        create(
          :transaction,
          allocation:       regular_alloc,
          transaction_date: '2024-01-15',
          withdrawal_amount: 30_000,
          deposit_amount:    0
        )
        rows = build_query(group_by: 'month').results
        # Only OOB category rows should appear; regular spending category must not
        expect(rows).to be_empty
      end

      it 'includes both OOB category names' do
        # Supplement category transaction
        setup_oob_month(month: '2024-01', category: @supplement_category, actual: 5_000)
        # OOB category transaction
        setup_oob_month(month: '2024-01', category: @oob_category, actual: 3_000)
        rows = build_query(group_by: 'month').results
        expect(rows.first[:total_cents]).to eq(8_000)
      end
    end

    # ─── Money display companions ─────────────────────────────────────────────

    context 'money display companions (group_by: month)' do
      before { setup_oob_month(month: '2024-01', actual: 10_000) }

      describe 'money fields have display companions' do
        let(:rows) { build_query(group_by: 'month').results }

        include_examples "money fields have display companions"
      end
    end

    context 'money display companions (group_by: allocation_name)' do
      before { setup_oob_month(month: '2024-01', actual: 10_000) }

      describe 'money fields have display companions' do
        let(:rows) { build_query(group_by: 'allocation_name').results }

        include_examples "money fields have display companions"
      end
    end

    context 'money display companions (group_by: calendar_month)' do
      before { setup_oob_month(month: '2024-01', actual: 10_000) }

      describe 'money fields have display companions' do
        let(:rows) { build_query(group_by: 'calendar_month').results }

        include_examples "money fields have display companions"
      end
    end

    # ─── Tenant scoping ───────────────────────────────────────────────────────

    it 'scopes to the current tenant — a different household sees no data' do
      setup_oob_month(month: '2024-01', actual: 10_000)

      other_household = create(:household)
      ActsAsTenant.current_tenant = other_household
      expect(build_query(group_by: 'month').results).to be_empty
    ensure
      ActsAsTenant.current_tenant = @household
    end

    # ─── Date range filtering ─────────────────────────────────────────────────

    it 'only includes months within the start_month/end_month range' do
      setup_oob_month(month: '2023-12', actual: 5_000) # outside
      setup_oob_month(month: '2024-01', actual: 10_000) # inside
      setup_oob_month(month: '2024-02', actual: 7_000)  # inside
      setup_oob_month(month: '2024-04', actual: 3_000)  # outside

      results = build_query(start_month: '2024-01', end_month: '2024-02', group_by: 'month').results
      expect(results.map { |r| r[:month] }).to contain_exactly('2024-01', '2024-02')
    end
  end
end
