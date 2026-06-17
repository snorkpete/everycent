namespace :payee do
  desc "Backfill payee_name for all eligible transactions in a household"
  task :backfill, [:household_id] => :environment do |_t, args|
    household_id = args[:household_id]&.to_i
    abort "Usage: bin/rails payee:backfill[HOUSEHOLD_ID]" unless household_id&.positive?

    # Only the exact string "false" disables dry run. DRY_RUN=0 / DRY_RUN=no still dry-runs.
    dry_run = ENV.fetch("DRY_RUN", "true") != "false"
    puts dry_run ? "=== DRY RUN ===" : "=== APPLYING CHANGES ==="
    puts ""

    result = PayeeBackfill.new(household_id: household_id, dry_run: dry_run).call

    puts "--- SUMMARY ---"
    puts "Household:               #{result[:household_id]}"
    puts "Considered:              #{result[:considered]}"
    puts "  Named:                 #{result[:named]}"
    puts "  Cleared:               #{result[:cleared]}"
    puts "  No extractor:          #{result[:no_extractor]}"
    puts ""
    puts dry_run ? "Set DRY_RUN=false to apply." : "Done. #{result[:named]} transactions updated."
  end
end
