# Deletes conversation_turns (and their steps) older than the given cutoff,
# across ALL households. Cost records (llm_usage_records) are never touched.
#
# There is no DB-level ON DELETE CASCADE from conversation_turn_steps to
# conversation_turns (the FK is a uuid column, not a references FK). Steps
# are deleted explicitly in a set-based DELETE before the turns are removed.
#
# Usage:
#   result = ConversationTurnPurge.new(older_than: 180.days.ago).call
#   # => { turns_deleted: 42, steps_deleted: 137 }
#
# The rake task (transcripts:purge) hardcodes 180 days, but this service
# accepts any cutoff so it can be reused by a future scheduler task.
class ConversationTurnPurge
  # One named constant for the default retention window.
  # The rake task references this; the scheduler task can reuse it or pass
  # an explicit `older_than:` value.
  RETENTION_DAYS = 180

  Result = Struct.new(:turns_deleted, :steps_deleted, keyword_init: true)

  def initialize(older_than:)
    @older_than = older_than
  end

  def call
    turns_deleted = 0
    steps_deleted = 0

    ActsAsTenant.without_tenant do
      # Identify the turns to purge as a subquery so both deletes
      # target exactly the same set without a race window.
      old_turn_ids = ConversationTurn
        .where("created_at < ?", @older_than)
        .pluck(:conversation_turn_id)

      if old_turn_ids.any?
        steps_deleted = ConversationTurnStep
          .where(conversation_turn_id: old_turn_ids)
          .delete_all

        turns_deleted = ConversationTurn
          .where(conversation_turn_id: old_turn_ids)
          .delete_all
      end
    end

    Result.new(turns_deleted: turns_deleted, steps_deleted: steps_deleted)
  end
end
