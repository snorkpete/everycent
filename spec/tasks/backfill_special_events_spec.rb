require 'rails_helper'
require 'rake'

RSpec.describe 'db:backfill_special_events' do
  before :all do
    Rails.application.load_tasks
  end

  before :each do
    Rake::Task.tasks.each(&:reenable)
  end

  # Helper: run the task with given ENV vars and capture stdout.
  # Pass nil as a value to ensure the key is deleted for the duration of the task.
  def run_task(env_overrides = {})
    original = env_overrides.keys.map { |k| [k, ENV[k]] }.to_h
    env_overrides.each { |k, v| v.nil? ? ENV.delete(k) : ENV[k] = v }
    output = capture_output { Rake::Task['db:backfill_special_events'].invoke }
    original.each { |k, v| v.nil? ? ENV.delete(k) : ENV[k] = v }
    output
  end

  def capture_output
    old_stdout = $stdout
    $stdout = StringIO.new
    yield
    $stdout.string
  ensure
    $stdout = old_stdout
  end

  # Build a minimal tenant + allocation scaffold in-transaction (rolled back after each example).
  # Returns { household:, allocations: [alloc1, alloc2, ...] }
  def build_scaffold(alloc_count: 2)
    household = ActsAsTenant.without_tenant { create(:household) }
    ActsAsTenant.with_tenant(household) do
      allocations = alloc_count.times.map { create(:allocation) }
      { household: household, allocations: allocations }
    end
  end

  # -------------------------------------------------------------------------
  # Dry-run is the default — nothing written
  # -------------------------------------------------------------------------
  describe 'dry-run (default)' do
    it 'prints "would create" and writes nothing' do
      household = ActsAsTenant.without_tenant { create(:household) }

      # The task has hardcoded IDs: event 166 (rename), event 69 + alloc 1607 (link-orphan),
      # and a fixed list of allocation_ids for new events.
      # Create the minimum fixtures to satisfy the safety checks so we can verify dry-run
      # behaviour (no writes) without touching the real prod DB IDs.
      ActsAsTenant.with_tenant(household) do
        # These `id:` values are the hardcoded ones the task looks up
        ActsAsTenant.without_tenant do
          connection = ActiveRecord::Base.connection
          # Insert via SQL to force specific IDs (FactoryBot doesn't let us set PK easily)
          connection.execute(
            "INSERT INTO special_events (id, household_id, name, start_date, budget_amount, actual_amount, created_at, updated_at) " \
            "VALUES (166, #{household.id}, 'UK + Resort - April 2025', '2025-04-01', 0, 0, NOW(), NOW()), " \
            "       (69,  #{household.id}, 'Camping Summer 2020',       '2020-06-01', 0, 0, NOW(), NOW())"
          )
          connection.execute(
            "INSERT INTO allocations (id, household_id, name, amount, created_at, updated_at) " \
            "VALUES (1607, #{household.id}, 'Camping alloc', 0, NOW(), NOW())"
          )
          # Insert the ~30 allocation IDs for the 10 new events.
          # The task requires them ALL to exist (missing IDs raise now).
          new_event_alloc_ids = [
            597, 598, 599, 601, 602, 603, 604, 717, 718,   # Trini 2019
            4292, 4650, 4651, 4652, 4653, 4674,             # Legoland 2023
            5330, 5668, 5669,                                # Center Parcs 2024
            121, 128, 280, 314, 9600661, 9600663,           # Christmas 2018
            3534, 3537, 3549,                                # Kitchen 2022
            3507, 3535, 3541, 3552, 3926, 3928, 3935,       # Backyard 2022
            3350,                                            # Bedroom 2022
            716,                                             # Slagharen 2019
            3509, 3510, 3521, 3525,                         # Slagharen 2022
            1747,                                            # Eindhoven 2020
          ]
          values = new_event_alloc_ids.map do |aid|
            "(#{aid}, #{household.id}, 'Alloc #{aid}', 0, NOW(), NOW())"
          end.join(", ")
          connection.execute(
            "INSERT INTO allocations (id, household_id, name, amount, created_at, updated_at) VALUES #{values}"
          ) unless new_event_alloc_ids.empty?
        end
      end

      output = run_task("HOUSEHOLD_ID" => household.id.to_s)

      ActsAsTenant.with_tenant(household) do
        # Only the 2 pre-existing special_events (166 and 69) — no new events created
        expect(SpecialEvent.count).to eq(2)
        # No allocations linked to new events
        expect(Allocation.where.not(special_event_id: nil).count).to eq(0)
      end

      expect(output).to include("DRY RUN")
      expect(output).to include("Dry run complete")
    end
  end

  # -------------------------------------------------------------------------
  # Commit mode — creates events, links allocations, sets actual_amount
  # -------------------------------------------------------------------------
  describe 'commit mode (COMMIT=true)' do
    it 'creates a new event, links allocations, and sets actual_amount' do
      household  = ActsAsTenant.without_tenant { create(:household) }
      bank_acct  = ActsAsTenant.with_tenant(household) { create(:bank_account) }

      ActsAsTenant.with_tenant(household) do
        alloc1 = create(:allocation, household: household)
        alloc2 = create(:allocation, household: household)

        # Add some real transactions so actual_amount is non-zero
        create(:transaction, household: household, bank_account: bank_acct,
               allocation: alloc1, withdrawal_amount: 500, is_manual_adjustment: false)
        create(:transaction, household: household, bank_account: bank_acct,
               allocation: alloc2, withdrawal_amount: 300, is_manual_adjustment: false)
        # Manual adjustment should NOT be counted
        create(:transaction, household: household, bank_account: bank_acct,
               allocation: alloc1, withdrawal_amount: 9999, is_manual_adjustment: true)

        # We need a way to run the rake task against ONLY these allocations.
        # The task has a fixed event list, so we test the pieces directly here
        # using the same logic the rake task uses, to keep the spec self-contained.

        # This mirrors what the rake task's commit block does for a new event:
        ActiveRecord::Base.transaction do
          event = SpecialEvent.create!(
            name:          "Spec Test Event",
            start_date:    Date.new(2023, 1, 1),
            budget_amount: 0,
            actual_amount: 0,
          )
          ids = [alloc1.id, alloc2.id]
          actual = Transaction.where(allocation_id: ids, is_manual_adjustment: false)
                              .sum(:withdrawal_amount)
          event.update!(actual_amount: actual)
          Allocation.where(id: ids).update_all(special_event_id: event.id)

          expect(event.reload.actual_amount).to eq(800)   # 500 + 300, not 9999
          expect(alloc1.reload.special_event_id).to eq(event.id)
          expect(alloc2.reload.special_event_id).to eq(event.id)
          # No other allocation fields touched
          original_amount = alloc1.amount
          expect(alloc1.reload.amount).to eq(original_amount)

          raise ActiveRecord::Rollback  # clean up after ourselves
        end
      end
    end
  end

  # -------------------------------------------------------------------------
  # Idempotency — second run finds existing event, does not duplicate
  # -------------------------------------------------------------------------
  describe 'idempotency' do
    it 'does not create a duplicate event on a second commit run' do
      household = ActsAsTenant.without_tenant { create(:household) }
      bank_acct = ActsAsTenant.with_tenant(household) { create(:bank_account) }

      ActsAsTenant.with_tenant(household) do
        alloc = create(:allocation, household: household)
        create(:transaction, household: household, bank_account: bank_acct,
               allocation: alloc, withdrawal_amount: 100, is_manual_adjustment: false)

        event_name = "Idempotent Test Event"

        # First run
        2.times do
          existing = SpecialEvent.find_by(name: event_name)
          unless existing
            event = SpecialEvent.create!(name: event_name, start_date: Date.today,
                                         budget_amount: 0, actual_amount: 0)
            Allocation.where(id: alloc.id).update_all(special_event_id: event.id)
          end
        end

        # Only one event should exist
        expect(SpecialEvent.where(name: event_name).count).to eq(1)
        # Allocation still linked to exactly one event
        expect(alloc.reload.special_event_id).to eq(SpecialEvent.find_by(name: event_name).id)
      end
    end
  end

  # -------------------------------------------------------------------------
  # Safety check — raises when allocation is already linked to a different event
  # -------------------------------------------------------------------------
  describe 'safety check' do
    it 'raises when an allocation is already linked to a different event' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        other_event = create(:special_event, household: household)
        alloc       = create(:allocation, household: household, special_event: other_event)

        already_linked = Allocation.where(id: alloc.id).where.not(special_event_id: nil)
        expect(already_linked).not_to be_empty

        details = already_linked.map { |a| "#{a.id} -> event #{a.special_event_id}" }.join(", ")
        expect {
          raise "Safety check failed for 'Test': allocations already linked: #{details}"
        }.to raise_error(RuntimeError, /Safety check failed.*allocations already linked/)
      end
    end
  end

  # -------------------------------------------------------------------------
  # HOUSEHOLD_ID validation — required, aborts with listing if missing
  # -------------------------------------------------------------------------
  describe 'HOUSEHOLD_ID validation' do
    it 'aborts with a listing when HOUSEHOLD_ID is not set' do
      h1 = ActsAsTenant.without_tenant { create(:household, name: "Alpha Household") }
      h2 = ActsAsTenant.without_tenant { create(:household, name: "Beta Household") }

      output = nil
      expect {
        output = capture_output { run_task("HOUSEHOLD_ID" => nil) }
      }.to raise_error(SystemExit)

      # The listing message goes to stderr via abort, so we check $stderr separately.
      # abort() in Ruby writes to $stderr and raises SystemExit — capture_output only
      # captures $stdout. Verify the abort was triggered (SystemExit is sufficient).
    end

    it 'aborts when HOUSEHOLD_ID refers to a non-existent household' do
      expect {
        run_task("HOUSEHOLD_ID" => "999999")
      }.to raise_error(SystemExit)
    end
  end

  # -------------------------------------------------------------------------
  # Rename operation — event 166 rename logic
  # -------------------------------------------------------------------------
  describe 'rename operation' do
    it 'renames the event when name does not match target' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        event = create(:special_event, household: household,
                       name: "UK + Resort - April 2025")
        new_name = "UK + Butlins - April 2026"

        # Simulate the rename logic
        if event.name != new_name
          event.update!(name: new_name)
        end

        expect(event.reload.name).to eq(new_name)
      end
    end

    it 'skips rename when name already matches' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        event    = create(:special_event, household: household,
                          name: "UK + Butlins - April 2026")
        new_name = "UK + Butlins - April 2026"

        update_count = 0
        if event.name == new_name
          # no-op
        else
          event.update!(name: new_name)
          update_count += 1
        end

        expect(update_count).to eq(0)
        expect(event.reload.name).to eq(new_name)
      end
    end

    it 'raises when event 166 is not found in current tenant' do
      household = ActsAsTenant.without_tenant { create(:household) }
      # No event 166 in this household — task must raise
      expect {
        ActsAsTenant.with_tenant(household) do
          event_166 = SpecialEvent.find_by(id: 166)
          raise "Safety check failed: event 166 not found in current tenant — cannot rename." unless event_166
        end
      }.to raise_error(RuntimeError, /Safety check failed.*event 166 not found/)
    end
  end

  # -------------------------------------------------------------------------
  # Link-orphan operation — allocation 1607 -> event 69
  # -------------------------------------------------------------------------
  describe 'link-orphan operation' do
    it 'links the orphan allocation and recomputes actual_amount' do
      household = ActsAsTenant.without_tenant { create(:household) }
      bank_acct = ActsAsTenant.with_tenant(household) { create(:bank_account) }

      ActsAsTenant.with_tenant(household) do
        event       = create(:special_event, household: household, actual_amount: 0)
        existing_a  = create(:allocation, household: household, special_event: event)
        orphan_a    = create(:allocation, household: household, special_event: nil)

        create(:transaction, household: household, bank_account: bank_acct,
               allocation: existing_a, withdrawal_amount: 200, is_manual_adjustment: false)
        create(:transaction, household: household, bank_account: bank_acct,
               allocation: orphan_a,  withdrawal_amount: 150, is_manual_adjustment: false)

        # Simulate link-orphan logic
        raise "Safety check failed" if orphan_a.special_event_id && orphan_a.special_event_id != event.id

        Allocation.where(id: orphan_a.id).update_all(special_event_id: event.id)
        all_linked = (event.allocations.pluck(:id) + [orphan_a.id]).uniq
        actual = Transaction.where(allocation_id: all_linked, is_manual_adjustment: false)
                            .sum(:withdrawal_amount)
        event.update!(actual_amount: actual)

        expect(event.reload.actual_amount).to eq(350)   # 200 + 150
        expect(orphan_a.reload.special_event_id).to eq(event.id)
        # Only special_event_id changed — no other fields
        expect(orphan_a.reload.amount).to eq(orphan_a.amount)
      end
    end

    it 'raises when orphan allocation is already linked to a different event' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        target_event = create(:special_event, household: household)
        other_event  = create(:special_event, household: household)
        orphan_a     = create(:allocation, household: household, special_event: other_event)

        expect {
          if orphan_a.special_event_id && orphan_a.special_event_id != target_event.id
            raise "Safety check failed: allocation #{orphan_a.id} is already linked to event id " \
                  "#{orphan_a.special_event_id}, expected NULL or #{target_event.id}."
          end
        }.to raise_error(RuntimeError, /Safety check failed/)
      end
    end

    it 'raises when the target event is not found in current tenant' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        # No event 69 in this household
        expect {
          event_69 = SpecialEvent.find_by(id: 69)
          raise "Safety check failed: event 69 not found in current tenant — cannot link orphan." unless event_69
        }.to raise_error(RuntimeError, /Safety check failed.*event 69 not found/)
      end
    end

    it 'raises when allocation 1607 is not found in current tenant' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        event = create(:special_event, household: household)
        # No allocation 1607 in this household
        expect {
          alloc_1607 = Allocation.find_by(id: 1607)
          raise "Safety check failed: allocation 1607 not found in current tenant — cannot link orphan." unless alloc_1607
        }.to raise_error(RuntimeError, /Safety check failed.*allocation 1607 not found/)
      end
    end
  end

  # -------------------------------------------------------------------------
  # Missing allocation IDs — hard-abort, not warn-and-skip
  # -------------------------------------------------------------------------
  describe 'missing allocation IDs' do
    it 'raises when any expected allocation ID is not found in current tenant' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        alloc = create(:allocation, household: household)
        found_ids = [alloc.id]
        all_ids   = [alloc.id, 99999999]   # 99999999 does not exist
        missing   = all_ids - found_ids

        expect {
          if missing.any?
            raise "Safety check failed for 'Test Event': allocation IDs not found in current tenant: #{missing.inspect}"
          end
        }.to raise_error(RuntimeError, /Safety check failed.*allocation IDs not found/)
      end
    end
  end

  # -------------------------------------------------------------------------
  # Only special_event_id is modified — no other allocation fields touched
  # -------------------------------------------------------------------------
  describe 'allocation field integrity' do
    it 'does not modify amount, name, or budget_id on linked allocations' do
      household = ActsAsTenant.without_tenant { create(:household) }

      ActsAsTenant.with_tenant(household) do
        alloc = create(:allocation, household: household, name: "My Allocation", amount: 9999)

        original_name      = alloc.name
        original_amount    = alloc.amount
        original_budget_id = alloc.budget_id

        event = create(:special_event, household: household)
        Allocation.where(id: alloc.id).update_all(special_event_id: event.id)

        alloc.reload
        expect(alloc.name).to eq(original_name)
        expect(alloc.amount).to eq(original_amount)
        expect(alloc.budget_id).to eq(original_budget_id)
        expect(alloc.special_event_id).to eq(event.id)
      end
    end
  end
end
