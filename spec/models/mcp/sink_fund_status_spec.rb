require 'rails_helper'

RSpec.describe Mcp::SinkFundStatus, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household

    # Three sink fund accounts (tiers)
    @near_term_account = create(
      :bank_account,
      name:         'Sink Fund Account',
      account_type: 'sink_fund'
    )
    @long_term_account = create(
      :bank_account,
      name:         'Long Term Sink Fund',
      account_type: 'sink_fund'
    )
    @emergency_account = create(
      :bank_account,
      name:         'Emergency Fund Savings',
      account_type: 'sink_fund'
    )
  end

  def build_query(**overrides)
    Mcp::SinkFundStatus.new(**overrides)
  end

  # Helper to create a sink fund allocation with optional deposit and/or withdrawal
  def setup_sink_fund(account:, name:, target:, deposits: [], withdrawals: [], status: 'open')
    sfa = create(
      :sink_fund_allocation,
      name:            name,
      bank_account:    account,
      amount:          target,
      status:          status
    )
    deposits.each do |amount|
      create(
        :transaction,
        sink_fund_allocation: sfa,
        transaction_date:     '2024-01-15',
        deposit_amount:        amount,
        withdrawal_amount:     0
      )
    end
    withdrawals.each do |amount|
      create(
        :transaction,
        sink_fund_allocation: sfa,
        transaction_date:     '2024-01-20',
        withdrawal_amount:     amount,
        deposit_amount:        0
      )
    end
    sfa
  end

  # ─── Validations ─────────────────────────────────────────────────────────────

  describe 'validations' do
    it 'is valid with no arguments' do
      expect(build_query).to be_valid
    end

    it 'is valid with a string account name' do
      expect(build_query(account: 'Sink Fund Account')).to be_valid
    end

    it 'is valid with include_closed: true' do
      expect(build_query(include_closed: true)).to be_valid
    end
  end

  # ─── Results ─────────────────────────────────────────────────────────────────

  describe '#results' do
    it 'raises when called on an invalid object' do
      q = Mcp::SinkFundStatus.new
      allow(q).to receive(:valid?).and_return(false)
      expect { q.results }.to raise_error(RuntimeError, /Call valid\?/)
    end

    context 'with one open sink fund allocation' do
      before do
        @sfa = setup_sink_fund(
          account:    @near_term_account,
          name:       'Car Service',
          target:     50_000,
          deposits:   [30_000],
          withdrawals: [10_000]
        )
      end

      it 'returns a row with expected keys' do
        row = build_query.results.first
        expect(row.keys).to match_array(
          %i[name account status
             target_cents target_display
             funded_cents funded_display
             spent_cents spent_display
             remaining_cents remaining_display
             is_overdrawn]
        )
      end

      it 'returns the allocation name' do
        row = build_query.results.first
        expect(row[:name]).to eq('Car Service')
      end

      it 'returns the account (tier) name' do
        row = build_query.results.first
        expect(row[:account]).to eq('Sink Fund Account')
      end

      it 'returns target_cents from allocation amount' do
        row = build_query.results.first
        expect(row[:target_cents]).to eq(50_000)
        expect(row[:target_display]).to eq(Mcp::Money.display(50_000))
      end

      it 'returns funded_cents as total deposits' do
        row = build_query.results.first
        expect(row[:funded_cents]).to eq(30_000)
        expect(row[:funded_display]).to eq(Mcp::Money.display(30_000))
      end

      it 'returns spent_cents as total withdrawals' do
        row = build_query.results.first
        expect(row[:spent_cents]).to eq(10_000)
        expect(row[:spent_display]).to eq(Mcp::Money.display(10_000))
      end

      it 'computes remaining_cents = funded - spent (net balance in the allocation)' do
        # funded=30_000, spent=10_000
        # remaining = 30_000 - 10_000 = 20_000
        row = build_query.results.first
        expect(row[:remaining_cents]).to eq(20_000)
        expect(row[:remaining_display]).to eq(Mcp::Money.display(20_000))
      end

      it 'is_overdrawn is false when remaining >= 0' do
        row = build_query.results.first
        expect(row[:is_overdrawn]).to be false
      end
    end

    # ─── Overdrawn flagging ───────────────────────────────────────────────────

    context 'with an overdrawn allocation' do
      before do
        # target = 10_000, funded = 5_000, spent = 20_000 → remaining = -15_000
        setup_sink_fund(
          account:    @near_term_account,
          name:       'Overdrawn Item',
          target:     10_000,
          deposits:   [5_000],
          withdrawals: [20_000]
        )
      end

      it 'returns negative remaining_cents for an overdrawn allocation' do
        row = build_query.results.first
        expect(row[:remaining_cents]).to eq(-15_000)
        expect(row[:remaining_display]).to eq(Mcp::Money.display(-15_000))
      end

      it 'flags is_overdrawn: true for negative remaining' do
        row = build_query.results.first
        expect(row[:is_overdrawn]).to be true
      end
    end

    # ─── include_closed ───────────────────────────────────────────────────────

    context 'include_closed: false (default)' do
      before do
        setup_sink_fund(account: @near_term_account, name: 'Open Item',   target: 10_000, status: 'open')
        setup_sink_fund(account: @near_term_account, name: 'Closed Item', target: 5_000,  status: 'closed')
      end

      it 'excludes closed allocations by default' do
        names = build_query.results.map { |r| r[:name] }
        expect(names).to include('Open Item')
        expect(names).not_to include('Closed Item')
      end
    end

    context 'include_closed: true' do
      before do
        setup_sink_fund(account: @near_term_account, name: 'Open Item',   target: 10_000, status: 'open')
        setup_sink_fund(account: @near_term_account, name: 'Closed Item', target: 5_000,  status: 'closed')
      end

      it 'includes closed allocations when include_closed: true' do
        names = build_query(include_closed: true).results.map { |r| r[:name] }
        expect(names).to include('Open Item', 'Closed Item')
      end
    end

    # ─── account filter ───────────────────────────────────────────────────────

    context 'account filter' do
      before do
        setup_sink_fund(account: @near_term_account, name: 'Near-term item', target: 10_000)
        setup_sink_fund(account: @long_term_account, name: 'Long-term item', target: 20_000)
      end

      it 'filters to a specific account when account param provided' do
        results = build_query(account: 'Sink Fund Account').results
        expect(results.map { |r| r[:name] }).to contain_exactly('Near-term item')
      end

      it 'returns all accounts when account param is nil' do
        results = build_query.results
        expect(results.map { |r| r[:name] }).to include('Near-term item', 'Long-term item')
      end
    end

    # ─── Sorting ─────────────────────────────────────────────────────────────

    it 'sorts by account name ASC, then allocation name ASC' do
      setup_sink_fund(account: @near_term_account, name: 'Zebra',  target: 5_000)
      setup_sink_fund(account: @near_term_account, name: 'Alpha',  target: 5_000)
      setup_sink_fund(account: @long_term_account, name: 'Middle', target: 5_000)

      results = build_query.results
      expect(results.map { |r| [r[:account], r[:name]] }).to eq([
        ['Long Term Sink Fund', 'Middle'],
        ['Sink Fund Account', 'Alpha'],
        ['Sink Fund Account', 'Zebra']
      ])
    end

    # ─── Only sink_fund accounts ──────────────────────────────────────────────

    it 'does not include allocations from non-sink-fund accounts' do
      normal_account = create(:bank_account, name: 'Checking', account_type: 'normal')
      create(:sink_fund_allocation, name: 'Stray Alloc', bank_account: normal_account, amount: 1_000)

      results = build_query(include_closed: true).results
      expect(results.map { |r| r[:name] }).not_to include('Stray Alloc')
    end

    # ─── Money display companions ─────────────────────────────────────────────

    context 'money display companions' do
      before do
        setup_sink_fund(
          account:    @near_term_account,
          name:       'Test',
          target:     50_000,
          deposits:   [30_000],
          withdrawals: [5_000]
        )
      end

      describe 'money fields have display companions' do
        let(:rows) { build_query.results }

        include_examples "money fields have display companions"
      end
    end

    # ─── Tenant scoping ───────────────────────────────────────────────────────

    it 'scopes to the current tenant — a different household sees no data' do
      setup_sink_fund(account: @near_term_account, name: 'My Item', target: 10_000)

      other_household = create(:household)
      ActsAsTenant.current_tenant = other_household
      expect(build_query.results).to be_empty
    ensure
      ActsAsTenant.current_tenant = @household
    end
  end
end
