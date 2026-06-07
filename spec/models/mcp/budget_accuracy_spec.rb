require 'rails_helper'

RSpec.describe Mcp::BudgetAccuracy, type: :model do
  before do
    @household    = create(:household)
    ActsAsTenant.current_tenant = @household
    @category     = create(:allocation_category, budget_role: 'spending', name: 'Groceries')
    @bank_account = create(:bank_account)
  end

  def build_query(**overrides)
    defaults = { start_month: '2024-01', end_month: '2024-03' }
    Mcp::BudgetAccuracy.new(**defaults.merge(overrides))
  end

  # Helper: create a budget + allocation + optional transaction for a given month
  def setup_month(month:, budgeted:, actual: nil, category: nil, allocation_name: 'Groceries', fixed: false)
    cat = category || @category
    date = "#{month}-01"
    budget = create(:budget, start_date: date)
    allocation = create(
      :allocation,
      name:                "#{allocation_name}",
      budget:              budget,
      allocation_category: cat,
      amount:              budgeted,
      is_fixed_amount:     fixed
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
        msg = q.errors.full_messages.to_sentence
        expect(msg).to include('end_month (2024-01) must not be before start_month (2024-06)')
      end

      it 'is valid when end_month equals start_month (single month range)' do
        expect(build_query(start_month: '2024-03', end_month: '2024-03')).to be_valid
      end
    end

    describe 'group_by' do
      it 'is valid with "allocation"' do
        expect(build_query(group_by: 'allocation')).to be_valid
      end

      it 'is valid with "category"' do
        expect(build_query(group_by: 'category')).to be_valid
      end

      it 'is invalid with an unrecognised value' do
        q = build_query(group_by: 'payee')
        expect(q).not_to be_valid
        expect(q.errors.full_messages.to_sentence).to include('group_by must be one of: allocation, category')
      end
    end

    describe 'sort_by' do
      it 'is valid with "pct_off"' do
        expect(build_query(sort_by: 'pct_off')).to be_valid
      end

      it 'is valid with "overspend_amount"' do
        expect(build_query(sort_by: 'overspend_amount')).to be_valid
      end

      it 'is valid with "underspend_amount"' do
        expect(build_query(sort_by: 'underspend_amount')).to be_valid
      end

      it 'is invalid with an unrecognised value' do
        q = build_query(sort_by: 'name')
        expect(q).not_to be_valid
        expect(q.errors.full_messages.to_sentence).to include('sort_by must be one of: pct_off, overspend_amount, underspend_amount')
      end
    end
  end

  describe '#results' do
    it 'raises when called on an invalid object' do
      expect { build_query(start_month: 'bad').results }.to raise_error(RuntimeError, /Call valid\?/)
    end

    # ─── Basic %-off computation ──────────────────────────────────────────────

    context 'with one month of data' do
      before do
        # Budget: 50_000 (€500), Actual: 60_000 (€600) → 20% over
        setup_month(month: '2024-01', budgeted: 50_000, actual: 60_000)
      end

      it 'returns a row with the expected keys' do
        row = build_query.results.first
        expect(row.keys).to match_array(
          %i[group_label group_by months_counted median_abs_pct_off avg_abs_pct_off
             pct_months_within_10 direction total_budgeted_cents total_actual_cents net_deviation_cents]
        )
      end

      it 'returns the correct group_by kind in the row' do
        row = build_query.results.first
        expect(row[:group_by]).to eq('allocation')
      end

      it 'returns months_counted = 1' do
        row = build_query.results.first
        expect(row[:months_counted]).to eq(1)
      end

      it 'computes median_abs_pct_off correctly for a 20% overspend' do
        row = build_query.results.first
        expect(row[:median_abs_pct_off]).to be_within(0.2).of(20.0)
      end

      it 'computes direction as "over" when actual > budgeted' do
        row = build_query.results.first
        expect(row[:direction]).to eq('over')
      end

      it 'returns total_budgeted_cents' do
        row = build_query.results.first
        expect(row[:total_budgeted_cents]).to eq(50_000)
      end

      it 'returns total_actual_cents' do
        row = build_query.results.first
        expect(row[:total_actual_cents]).to eq(60_000)
      end

      it 'returns net_deviation_cents = 10_000' do
        row = build_query.results.first
        expect(row[:net_deviation_cents]).to eq(10_000)
      end
    end

    context 'with zero actual spend (100% underspend)' do
      before { setup_month(month: '2024-01', budgeted: 50_000, actual: nil) }

      it 'computes direction as "under" when actual < budgeted' do
        row = build_query.results.first
        expect(row[:direction]).to eq('under')
      end

      it 'computes median_abs_pct_off = 100.0 when actual is 0' do
        row = build_query.results.first
        expect(row[:median_abs_pct_off]).to be_within(0.2).of(100.0)
      end
    end

    # ─── Median vs avg ────────────────────────────────────────────────────────

    context 'with three months (one freak month)' do
      before do
        # Jan: 10% over, Feb: 10% over, Mar: 100% over (freak)
        setup_month(month: '2024-01', budgeted: 50_000, actual: 55_000, allocation_name: 'Groceries')
        setup_month(month: '2024-02', budgeted: 50_000, actual: 55_000, allocation_name: 'Groceries')
        setup_month(month: '2024-03', budgeted: 50_000, actual: 100_000, allocation_name: 'Groceries')
      end

      it 'has months_counted = 3' do
        row = build_query.results.first
        expect(row[:months_counted]).to eq(3)
      end

      it 'median is robust to freak month (10% not 40%)' do
        row = build_query.results.first
        # Median of [10, 10, 100] = 10
        expect(row[:median_abs_pct_off]).to be_within(0.5).of(10.0)
      end

      it 'avg is pulled up by freak month' do
        row = build_query.results.first
        # avg([10, 10, 100]) = 40
        expect(row[:avg_abs_pct_off]).to be_within(0.5).of(40.0)
      end
    end

    # ─── % within 10% ─────────────────────────────────────────────────────────

    context 'pct_months_within_10 computation' do
      before do
        # Jan: 5% over (within 10%), Feb: 5% over (within 10%), Mar: 20% over (outside)
        setup_month(month: '2024-01', budgeted: 100_000, actual: 105_000)
        setup_month(month: '2024-02', budgeted: 100_000, actual: 105_000)
        setup_month(month: '2024-03', budgeted: 100_000, actual: 120_000)
      end

      it 'returns approximately 66.7% when 2 of 3 months are within 10%' do
        row = build_query.results.first
        expect(row[:pct_months_within_10]).to be_within(0.5).of(66.7)
      end
    end

    # ─── €10 noise floor ─────────────────────────────────────────────────────

    context '€10 noise floor' do
      it 'excludes months where budgeted <= 1000 cents' do
        # Budget of 500 cents (< €10 floor) — should be excluded
        setup_month(month: '2024-01', budgeted: 500, actual: 1000)
        expect(build_query.results).to be_empty
      end

      it 'includes months where budgeted > 1000 cents' do
        setup_month(month: '2024-01', budgeted: 1001, actual: 500)
        expect(build_query.results).not_to be_empty
      end

      it 'excludes the whole group if all its months are below the noise floor' do
        setup_month(month: '2024-01', budgeted: 500, actual: 200)
        setup_month(month: '2024-02', budgeted: 300, actual: 100)
        expect(build_query.results).to be_empty
      end
    end

    # ─── variable_only ────────────────────────────────────────────────────────

    context 'variable_only: true' do
      before do
        setup_month(month: '2024-01', budgeted: 50_000, actual: 60_000, allocation_name: 'Fixed Bill', fixed: true)
        setup_month(month: '2024-01', budgeted: 50_000, actual: 70_000, allocation_name: 'Groceries', fixed: false)
      end

      it 'excludes fixed allocations when variable_only: true' do
        rows = build_query(variable_only: true).results
        expect(rows.map { |r| r[:group_label] }).not_to include('Fixed Bill')
      end

      it 'includes variable allocations when variable_only: true' do
        rows = build_query(variable_only: true).results
        expect(rows.map { |r| r[:group_label] }).to include('Groceries')
      end

      it 'includes both when variable_only: false (default)' do
        rows = build_query(variable_only: false).results
        labels = rows.map { |r| r[:group_label] }
        expect(labels).to include('Groceries', 'Fixed Bill')
      end
    end

    # ─── canonical_name_sql merge ─────────────────────────────────────────────

    context 'group_by: allocation — canonical name merge' do
      before do
        # Two months with month-suffix variants should merge into one row
        setup_month(month: '2024-01', budgeted: 50_000, actual: 55_000, allocation_name: 'Car Insurance (Jan)')
        setup_month(month: '2024-02', budgeted: 50_000, actual: 45_000, allocation_name: 'Car Insurance (Feb)')
      end

      it 'merges month-suffix variants into one row' do
        rows = build_query(group_by: 'allocation').results
        labels = rows.map { |r| r[:group_label] }
        expect(labels.uniq.length).to eq(1)
        expect(labels.first).to eq('Car Insurance')
      end

      it 'counts both months' do
        row = build_query(group_by: 'allocation').results.first
        expect(row[:months_counted]).to eq(2)
      end
    end

    # ─── group_by: category ───────────────────────────────────────────────────

    context 'group_by: category' do
      before do
        @cat2 = create(:allocation_category, budget_role: 'spending', name: 'Transport')
        setup_month(month: '2024-01', budgeted: 50_000, actual: 60_000, category: @category)
        setup_month(month: '2024-01', budgeted: 30_000, actual: 20_000, category: @cat2)
      end

      it 'groups by category name' do
        rows = build_query(group_by: 'category').results
        labels = rows.map { |r| r[:group_label] }
        expect(labels).to include('Groceries', 'Transport')
      end

      it 'returns group_by = "category" in each row' do
        rows = build_query(group_by: 'category').results
        expect(rows.map { |r| r[:group_by] }.uniq).to eq(['category'])
      end
    end

    # ─── sort_by: pct_off (default) ───────────────────────────────────────────

    context 'sort_by: pct_off (worst predicted first)' do
      before do
        # Groceries: 10% off, Transport: 50% off → Transport should come first
        @cat2 = create(:allocation_category, budget_role: 'spending', name: 'Transport')
        setup_month(month: '2024-01', budgeted: 100_000, actual: 110_000, category: @category)
        setup_month(month: '2024-01', budgeted: 100_000, actual: 150_000, category: @cat2)
      end

      it 'sorts worst-predicted (highest median abs %-off) first' do
        rows = build_query(sort_by: 'pct_off', group_by: 'category').results
        expect(rows.first[:group_label]).to eq('Transport')
      end
    end

    # ─── sort_by: overspend_amount ────────────────────────────────────────────

    context 'sort_by: overspend_amount' do
      before do
        @cat2 = create(:allocation_category, budget_role: 'spending', name: 'Transport')
        # Groceries: +10_000 net (over), Transport: +30_000 net (over)
        setup_month(month: '2024-01', budgeted: 100_000, actual: 110_000, category: @category)
        setup_month(month: '2024-01', budgeted: 100_000, actual: 130_000, category: @cat2)
      end

      it 'sorts by highest net overspend first' do
        rows = build_query(sort_by: 'overspend_amount', group_by: 'category').results
        expect(rows.first[:group_label]).to eq('Transport')
      end
    end

    # ─── sort_by: underspend_amount ───────────────────────────────────────────

    context 'sort_by: underspend_amount' do
      before do
        @cat2 = create(:allocation_category, budget_role: 'spending', name: 'Transport')
        # Groceries: -10_000 net (under), Transport: -30_000 net (under)
        setup_month(month: '2024-01', budgeted: 100_000, actual: 90_000, category: @category)
        setup_month(month: '2024-01', budgeted: 100_000, actual: 70_000, category: @cat2)
      end

      it 'sorts by highest underspend (most negative net deviation) first' do
        rows = build_query(sort_by: 'underspend_amount', group_by: 'category').results
        expect(rows.first[:group_label]).to eq('Transport')
      end
    end

    # ─── Spending-scope exclusions ────────────────────────────────────────────

    context 'excluded data' do
      before do
        @budget = create(:budget, start_date: '2024-01-01')
        @allocation = create(
          :allocation,
          name:                'Groceries',
          budget:              @budget,
          allocation_category: @category,
          amount:              50_000
        )
      end

      it 'excludes brought-forward transactions' do
        create(
          :transaction,
          allocation:             @allocation,
          transaction_date:       '2024-01-15',
          withdrawal_amount:       20_000,
          deposit_amount:          0,
          brought_forward_status: 'added'
        )
        row = build_query.results.first
        expect(row[:total_actual_cents]).to eq(0)
      end

      it 'excludes manual adjustment transactions' do
        create(
          :transaction,
          allocation:          @allocation,
          transaction_date:    '2024-01-15',
          withdrawal_amount:    20_000,
          deposit_amount:       0,
          is_manual_adjustment: true
        )
        row = build_query.results.first
        expect(row[:total_actual_cents]).to eq(0)
      end

      it 'excludes non-spending categories' do
        savings_cat = create(:allocation_category, budget_role: 'savings', name: 'Savings')
        savings_alloc = create(
          :allocation,
          budget:              @budget,
          allocation_category: savings_cat,
          amount:              50_000
        )
        create(
          :transaction,
          allocation:       savings_alloc,
          transaction_date: '2024-01-15',
          withdrawal_amount: 10_000,
          deposit_amount:    0
        )
        labels = build_query.results.map { |r| r[:group_label] }
        expect(labels).not_to include('Savings')
      end

      it 'excludes placeholder allocations (amount <= 10 cents)' do
        placeholder_alloc = create(
          :allocation,
          name:                'Placeholder Item',
          budget:              @budget,
          allocation_category: @category,
          amount:              1
        )
        create(
          :transaction,
          allocation:       placeholder_alloc,
          transaction_date: '2024-01-15',
          withdrawal_amount: 5_000,
          deposit_amount:    0
        )
        labels = build_query.results.map { |r| r[:group_label] }
        expect(labels).not_to include('Placeholder Item')
      end
    end

    # ─── Household scoping ────────────────────────────────────────────────────

    it 'scopes to the current tenant — a different household sees no data' do
      setup_month(month: '2024-01', budgeted: 50_000, actual: 60_000)

      other_household = create(:household)
      ActsAsTenant.current_tenant = other_household
      expect(build_query.results).to be_empty
    ensure
      ActsAsTenant.current_tenant = @household
    end

    # ─── Month range ─────────────────────────────────────────────────────────

    context 'month range filtering' do
      before do
        setup_month(month: '2023-12', budgeted: 50_000, actual: 60_000) # outside range
        setup_month(month: '2024-01', budgeted: 50_000, actual: 55_000) # inside
        setup_month(month: '2024-03', budgeted: 50_000, actual: 45_000) # inside
        setup_month(month: '2024-04', budgeted: 50_000, actual: 60_000) # outside range
      end

      it 'only counts months within the start_month/end_month range' do
        row = build_query(start_month: '2024-01', end_month: '2024-03').results.first
        expect(row[:months_counted]).to eq(2)
      end
    end
  end
end
