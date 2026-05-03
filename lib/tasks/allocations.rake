namespace :allocations do
  desc "Consolidate allocation name variants to canonical (latest budget) form for a household"
  task :consolidate_names, [:household_id] => :environment do |_t, args|
    household_id = args[:household_id]&.to_i
    abort "Usage: bin/rails allocations:consolidate_names[HOUSEHOLD_ID]" unless household_id&.positive?

    dry_run = ENV.fetch("DRY_RUN", "true") != "false"
    puts dry_run ? "=== DRY RUN ===" : "=== APPLYING CHANGES ==="
    puts ""

    allocations = Allocation.joins(:budget)
      .where(budgets: { household_id: household_id })
      .select("allocations.id, allocations.name, budgets.start_date")

    groups = allocations.group_by { |a| consolidation_normalize(a.name) }

    total_renames = 0
    total_allocations = 0

    groups.sort_by { |k, _| k }.each do |_normalized, members|
      next if members.map(&:name).uniq.size == 1

      canonical = members.max_by { |a| a.start_date }&.name&.strip
      variants = members.map(&:name).uniq.sort
      ids_to_rename = members.reject { |a| a.name == canonical }.map(&:id)

      next if ids_to_rename.empty?

      total_renames += 1
      total_allocations += ids_to_rename.size

      puts "#{canonical}  (#{members.size} allocations, #{variants.size} variants)"
      variants.each do |v|
        marker = v == canonical ? " <-- canonical" : ""
        count = members.count { |a| a.name == v }
        puts "  #{v} (#{count})#{marker}"
      end
      puts ""

      unless dry_run
        Allocation.where(id: ids_to_rename).update_all(name: canonical)
      end
    end

    puts "--- SUMMARY ---"
    puts "Groups with variants: #{total_renames}"
    puts "Allocations to rename: #{total_allocations}"
    puts ""
    puts dry_run ? "Set DRY_RUN=false to apply." : "Done. #{total_allocations} allocations renamed."
  end

  desc "Classify allocation_class (need/want/savings/bookkeeping) for NL household"
  task :classify_nl => :environment do
    household_id = 96
    dry_run = ENV.fetch("DRY_RUN", "true") != "false"
    puts dry_run ? "=== DRY RUN ===" : "=== APPLYING CHANGES ==="
    puts ""

    names = Allocation.joins(:budget)
      .where(budgets: { household_id: household_id })
      .distinct.pluck(:name).sort_by { |n| n.downcase }

    classified = names.group_by { |n| classify_allocation(n) }

    %w[need want savings bookkeeping].each do |klass|
      items = classified[klass] || []
      puts "\n=== #{klass.upcase} (#{items.size}) ==="
      items.each { |n| puts "  #{n}" }
    end

    puts "\n--- SUMMARY ---"
    %w[need want savings bookkeeping].each do |klass|
      puts "#{klass}: #{(classified[klass] || []).size}"
    end
    puts "total: #{names.size}"

    unless dry_run
      count = 0
      names.each do |name|
        klass = classify_allocation(name)
        updated = Allocation.joins(:budget)
          .where(budgets: { household_id: household_id, })
          .where(allocations: { name: name })
          .update_all(allocation_class: klass)
        count += updated
      end
      puts "\nUpdated #{count} allocation records."
    end
  end
end

# --- Consolidation helpers ---

def consolidation_normalize(name)
  n = name.strip.downcase
  n = n.gsub(/'s\b/, "").strip
  n = n.gsub(/\s+/, " ")
  n
end

# --- Classification helpers ---

EXPLICIT_CLASS = {
  # MEDICAL: Other — mixed
  'Kraamzorg + ancillary' => 'need',
  'DNA Testing Baby' => 'need',
  'Electrolysis Patrice' => 'want',

  # KIDS: Playgroup — mixed
  'Nathan Peuterspelen' => 'need',
  'Nathan Peuterspelzaal' => 'need',
  'Small Steps - Evan psz' => 'need',
  'Evan Playgroup' => 'want',
  'Playgroup' => 'want',
  'Playgroup (10 sessions)' => 'want',

  # BABY: Evan — mixed
  'Baby things/ diapers' => 'need',
  'New Stroller for Evan' => 'need',
  'Baby Monitor' => 'want',
  'Baby Purchases' => 'want',
  'Baby Shower Expenses' => 'want',
  'Babysitting' => 'want',
  'Heater for Baby changing table' => 'want',
  "Sylvia's Baby Shower" => 'want',

  # BANK — mixed
  'Bank Charges' => 'need',
  'CC Charges - to be paid w. Bonus' => 'want',
  'CC Charges b/f' => 'want',
  'Credit Card b/f' => 'want',
  'Credit Card b/f Personal' => 'want',

  # Uncategorized edge cases
  'Nathan Bike' => 'need',
  'One2Track Watch Nathan' => 'need',
  'Borre Dutch books for Aidan' => 'want',
  'USD Cash withdrawal' => 'want',
  'Car keys duplicate (old bill)' => 'need',
  'Simpel Add\'n Charges' => 'need',

  # Insurance: travel and bike are want, not need
  'Travel Insurance' => 'want',
  'OHRA Annual Travel Insurance (July)' => 'want',
  'Kion Bike Insurance' => 'want',

  # Rentokil — pest control = want, not rent
  'Rentokil Mice treatment' => 'want',
  'Rentokil Mouse extermination' => 'want',

  # Car rental = want, not rent
  'Rental E-car IONIQ' => 'want',

  # Belastingdienst: auto tax = need, tax returns = bookkeeping
  'Belastingdienst - Auto Tax' => 'need',

  # London passport trips are travel (want), not immigration (need)
  'London Passports (tix, exp)' => 'want',
  'London Trip collect passports' => 'want',

  # Pharmacy is want
  'Pharmacy' => 'want',
  'Pharmacy/ Excess' => 'want',

  # Netflix — not savings
  'Netflix' => 'want',

  # Early SF convention (no parentheses)
  'Misc (Visitor) SF' => 'bookkeeping',
}.freeze

BOOKKEEPING_NAMES = Set.new([
  'Bonus 2025 - transfer to Sink funds',
  'Bonus to LTSF',
  'Long Term Sink Fund Savings',
  'Long Term Sink Fund Savings (LTSF)',
  'LTSF Uncertainty Fund',
  'Reim. Sink Fund for TV, Monitor (Bonus purchases)',
  'Replenish Sink Fund Misc',
  'Sale of Shares 2025 - transfer to sink fund',
  'Sale of Shares LTSF',
  'Sale of Shares to LTSF',
  'Sink Fund - Bonus (LTSF)',
  'Sink Fund - Bonus to be allocated',
  'Sink Fund Inj - Budget Supplement',
  'Sink Fund Inj - Car Purchase',
  'Sink Fund Inj - Christmas gifts other',
  'Sink Fund Injections',
  'Sink Fund Injections - Special Events',
  'Sink Fund Injections Baby',
  'Sink Fund Replenish',
  'Sink Fund Savings',
  'Sink Fund Savings (SF)',
  'Uncertainty Fund (LTSF)',
  'Wagon LTSF',
  'Belasting 2024 Tax Return',
  'Belastingdienst 2020 Income Tax return',
  'Belastingdienst Tax Return',
  'Belastingdienst Tax Return adj 2021',
  'AH Savings cashed-in',
  'AH Spaarzegels',
  'Cash Withdrawal from EF',
  'To Cash (Silva Slagharen booking)',
]).freeze

SAVINGS_NAMES = Set.new([
  'Dogecoin purchase on crypto.com',
  'Emergency Fund Savings',
  'Emergency Fund Savings (Degiro)',
  'Estate Guru',
  'Estate Guru withdrawn',
  'ETF - Kids',
  'ETF Extra Retirement Savings for 30% End',
  'ETF Kids',
  'ETF Kids College Fund',
  'ETF Retirement Savings',
  'ETFmatic Investments',
  'ETorro & ETF Special deposit',
  'Kids ETF',
  'Kids ETF Savings',
  'Long Term Savings',
  'Long Term Savings (Emergency Fund)',
  'Purchase of Dogecoin - Crypto.com',
  'Reimburse Emergency Fund (EF)',
  'UTC Funds trans to Kids ETF',
  'Withdrawal from ETF Tax return error',
  'Aidan Savings',
  'Nathan Savings',
  'Kids Savings',
  'SVB Funds - kids savings',
]).freeze

NEED_PATTERNS = [
  /\bmortgage\b/i,
  /^rent$/i,
  /^rent deposit$/i,
  /property tax/i,
  /sewerage tax/i,
  /almere tax/i,
  /gemeente almere/i,
  /gblt/i,
  /waterboard/i,
  /^gas & electric$/i,
  /\bnuon\b/i,
  /vattenfall/i,
  /\bengie\b/i,
  /vitens/i,
  /^water$/i,
  /^water - /i,
  /water filter/i,
  /internet.*phone.*tv/i,
  /\bkpn\b/i,
  /\bodido\b/i,
  /^t-mobile/i,
  /simpel mobile/i,
  /\brepair\b/i,
  /\bplumbing\b/i,
  /unclog/i,
  /electrician/i,
  /door lock/i,
  /shower faucet/i,
  /home filter clean/i,
  /cleaning vent/i,
  /toilet seat/i,
  /kitchen cupboard/i,
  /witgoed/i,
  /spray clean.*front/i,
  /general household repair/i,
  /repairs general fund/i,
  /\bcar tax/i,
  /car apk/i,
  /car maintenance/i,
  /car repair/i,
  /new tyre/i,
  /speeding/i,
  /\bcjib\b/i,
  /\binsurances?\b/i,
  /medical excess/i,
  /cz.*excess/i,
  /excess.*cz/i,
  /hospital charge/i,
  /\bdentist\b/i,
  /\bdental\b/i,
  /\bdoctor\b/i,
  /\bglasses\b/i,
  /school fee/i,
  /school contribution/i,
  /school supplies/i,
  /school.*parent/i,
  /parent contribution/i,
  /school photo/i,
  /ovc.*book/i,
  /ovc plus/i,
  /middelbaar/i,
  /studygo/i,
  /back to school/i,
  /zwem/i,
  /swimming/i,
  /^groceries/i,
  /^clothing/i,
  /inburgering/i,
  /dutch (class|course|online)/i,
  /zamaradi/i,
  /nederlands les/i,
  /duo inburgering/i,
  /^acca\b/i,
  /learn signal acca/i,
  /fnv union/i,
  /passport/i,
  /\bvisas?\b/i,
  /driver.*license/i,
  /citizenship/i,
  /bosch (dryer|washing)/i,
  /new dishwasher/i,
  /^fans?( x2)?$/i,
  /^mobile phones?$/i,
  /^bmobile/i,
  /^cz medical insurance$/i,
  /^medical insurance$/i,
].freeze

SF_LTSF_PATTERN = /\((?:SF|LTSF)\)\s*$/i

def classify_allocation(name)
  return EXPLICIT_CLASS[name] if EXPLICIT_CLASS.key?(name)
  return 'bookkeeping' if name.match?(SF_LTSF_PATTERN)
  return 'bookkeeping' if BOOKKEEPING_NAMES.include?(name)
  return 'savings' if SAVINGS_NAMES.include?(name)
  return 'need' if NEED_PATTERNS.any? { |p| name.match?(p) }
  'want'
end
