namespace :db do
  desc "Backfill SpecialEvent records for historical vacations and projects. " \
       "Default mode is dry-run; pass COMMIT=true to actually write changes."
  task backfill_special_events: :environment do
    commit = ENV.fetch("COMMIT", "false").casecmp("true").zero?

    household_id = ENV["HOUSEHOLD_ID"]
    unless household_id.present?
      message = "ERROR: HOUSEHOLD_ID is required.\n\nAvailable households:\n"
      Household.unscoped.order(:id).each do |h|
        message += "  #{h.id} - #{h.name}\n"
      end
      message += "\nRe-run as: HOUSEHOLD_ID=<id> bundle exec rake db:backfill_special_events"
      abort message
    end

    household = Household.unscoped.find_by(id: household_id)
    abort "Household with id=#{household_id} not found." unless household

    mode_label = commit ? "COMMIT" : "DRY RUN"
    puts "=== db:backfill_special_events [#{mode_label}] — household: #{household.name} (id #{household.id}) ==="
    puts ""

    ActsAsTenant.with_tenant(household) do
      ActiveRecord::Base.transaction do
        # -----------------------------------------------------------------------
        # 1. Rename existing event id 166 (name typo, year wrong)
        # -----------------------------------------------------------------------
        event_166 = SpecialEvent.find_by(id: 166)
        raise "Safety check failed: event 166 not found in current tenant — cannot rename." unless event_166

        old_name = event_166.name
        new_name = "UK + Butlins - April 2026"
        if old_name == new_name
          puts "[rename] Event 166 already has the correct name — skipping."
        else
          puts "[rename] Event 166: '#{old_name}' -> '#{new_name}'"
          event_166.update!(name: new_name) if commit
        end
        puts ""

        # -----------------------------------------------------------------------
        # 2. Link orphan allocation 1607 to event id 69 (Camping Summer 2020)
        # -----------------------------------------------------------------------
        event_69 = SpecialEvent.find_by(id: 69)
        raise "Safety check failed: event 69 not found in current tenant — cannot link orphan." unless event_69

        alloc_1607 = Allocation.find_by(id: 1607)
        raise "Safety check failed: allocation 1607 not found in current tenant — cannot link orphan." unless alloc_1607

        if alloc_1607.special_event_id && alloc_1607.special_event_id != 69
          raise "Safety check failed: allocation 1607 is already linked to event id " \
                "#{alloc_1607.special_event_id}, expected NULL or 69."
        elsif alloc_1607.special_event_id == 69
          puts "[link-orphan] Allocation 1607 already linked to event 69 — skipping."
        else
          puts "[link-orphan] Linking allocation 1607 to event 69 ('#{event_69.name}')"
          Allocation.where(id: 1607).update_all(special_event_id: 69) if commit
        end

        # Recompute actual_amount always including allocation 1607
        # (whether it was just linked or was already linked)
        all_linked = (event_69.allocations.pluck(:id) + [1607]).uniq
        actual = Transaction.where(allocation_id: all_linked, is_manual_adjustment: false)
                            .sum(:withdrawal_amount)
        puts "  -> actual_amount would be: #{actual} cents"
        event_69.update!(actual_amount: actual) if commit
        puts ""

        # -----------------------------------------------------------------------
        # 3. New events
        # -----------------------------------------------------------------------
        new_events = [
          {
            name:           "Trini Trip - Summer 2019 (incomplete)",
            start_date:     Date.new(2019, 7, 1),
            allocation_ids: [597, 598, 599, 601, 602, 603, 604, 717, 718],
          },
          {
            name:           "Legoland Germany - July 2023",
            start_date:     Date.new(2023, 7, 1),
            allocation_ids: [4292, 4650, 4651, 4652, 4653, 4674],
          },
          {
            name:           "Center Parcs Holiday - May 2024",
            start_date:     Date.new(2024, 5, 1),
            allocation_ids: [5330, 5668, 5669],
          },
          {
            name:           "Christmas 2018 - UK Trip (incomplete)",
            start_date:     Date.new(2018, 12, 21),
            allocation_ids: [121, 128, 280, 314, 9600661, 9600663],
          },
          {
            name:           "Kitchen Renovation - 2022 (incomplete)",
            start_date:     Date.new(2022, 6, 1),
            allocation_ids: [3534, 3537, 3549],
          },
          {
            name:           "Backyard Renovation - 2022",
            start_date:     Date.new(2022, 5, 1),
            allocation_ids: [3507, 3535, 3541, 3552, 3926, 3928, 3935],
          },
          {
            name:           "Bedroom Painting - March 2022",
            start_date:     Date.new(2022, 3, 1),
            allocation_ids: [3350],
          },
          {
            name:           "Slagharen - June 2019 (incomplete)",
            start_date:     Date.new(2019, 6, 25),
            allocation_ids: [716],
          },
          {
            name:           "Slagharen - June 2022",
            start_date:     Date.new(2022, 6, 1),
            allocation_ids: [3509, 3510, 3521, 3525],
          },
          {
            name:           "Eindhoven Staycation - August 2020 (incomplete)",
            start_date:     Date.new(2020, 8, 3),
            allocation_ids: [1747],
          },
        ]

        new_events.each do |defn|
          name           = defn[:name]
          start_date     = defn[:start_date]
          allocation_ids = defn[:allocation_ids]

          # Idempotency: find by name within tenant scope
          existing = SpecialEvent.find_by(name: name)

          if existing
            puts "[skip] Event already exists: '#{name}' (id #{existing.id})"
            # Still report actual_amount for visibility
            actual = Transaction.where(allocation_id: allocation_ids, is_manual_adjustment: false)
                                .sum(:withdrawal_amount)
            puts "  -> actual_amount (computed): #{actual} cents"
            puts "  -> allocation IDs: #{allocation_ids.inspect}"
            puts ""
            next
          end

          # Safety check: all allocations must exist and be unlinked
          allocations = Allocation.where(id: allocation_ids)
          found_ids   = allocations.pluck(:id)
          missing     = allocation_ids - found_ids
          if missing.any?
            raise "Safety check failed for '#{name}': allocation IDs not found in current tenant: #{missing.inspect}"
          end

          already_linked = allocations.where.not(special_event_id: nil)
          unless already_linked.empty?
            details = already_linked.map { |a| "#{a.id} -> event #{a.special_event_id}" }.join(", ")
            raise "Safety check failed for '#{name}': allocations already linked: #{details}"
          end

          # Compute actual_amount from real transactions
          actual = Transaction.where(allocation_id: found_ids, is_manual_adjustment: false)
                              .sum(:withdrawal_amount)

          verb = commit ? "created" : "would create"
          puts "[#{verb}] '#{name}' (start_date: #{start_date})"
          puts "  -> actual_amount: #{actual} cents"
          puts "  -> allocation IDs: #{found_ids.inspect}"

          if commit
            event = SpecialEvent.create!(
              name:          name,
              start_date:    start_date,
              budget_amount: 0,
              actual_amount: actual,
            )
            Allocation.where(id: found_ids).update_all(special_event_id: event.id)
            puts "  -> event id: #{event.id}"
          end

          puts ""
        end

        raise ActiveRecord::Rollback unless commit
      end
    end

    puts ""
    if commit
      puts "=== Done. All changes committed. ==="
    else
      puts "=== Dry run complete. Pass COMMIT=true to apply changes. ==="
    end
  end
end
