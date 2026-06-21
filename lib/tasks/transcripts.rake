namespace :transcripts do
  # NOTE: desc is evaluated at rake parse-time, before the app is initialized and
  # Zeitwerk autoloading is active, so it must not reference autoloaded constants
  # (e.g. ConversationTurnPurge) — doing so aborts loading of the whole task list.
  # The retention window literal here mirrors ConversationTurnPurge::RETENTION_DAYS,
  # which the task body below uses for actual behaviour.
  desc "Delete conversation_turns and their steps older than 180 days (ConversationTurnPurge::RETENTION_DAYS). llm_usage_records are never purged."
  task purge: :environment do
    cutoff = ConversationTurnPurge::RETENTION_DAYS.days.ago

    puts "Purging conversation turns created before #{cutoff.to_fs(:db)}..."
    result = ConversationTurnPurge.new(older_than: cutoff).call

    puts "Done. Deleted #{result.turns_deleted} turn(s) and #{result.steps_deleted} step(s)."
  end
end
