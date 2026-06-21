namespace :transcripts do
  desc "Delete conversation_turns and their steps older than #{ConversationTurnPurge::RETENTION_DAYS} days. llm_usage_records are never purged."
  task purge: :environment do
    cutoff = ConversationTurnPurge::RETENTION_DAYS.days.ago

    puts "Purging conversation turns created before #{cutoff.to_fs(:db)}..."
    result = ConversationTurnPurge.new(older_than: cutoff).call

    puts "Done. Deleted #{result.turns_deleted} turn(s) and #{result.steps_deleted} step(s)."
  end
end
