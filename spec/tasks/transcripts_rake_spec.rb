require 'rails_helper'
require 'rake'

RSpec.describe 'transcripts rake tasks' do
  before :all do
    Rails.application.load_tasks
  end

  before :each do
    Rake::Task.tasks.each(&:reenable)
  end

  describe 'transcripts:purge' do
    let(:household_a) { ActsAsTenant.without_tenant { create(:household) } }
    let(:household_b) { ActsAsTenant.without_tenant { create(:household) } }

    def create_turn_with_steps(household:, created_at:, step_count: 1)
      ActsAsTenant.with_tenant(household) do
        turn = create(:conversation_turn, household: household)
        # Back-date after creation so we can control created_at precisely
        turn.update_columns(created_at: created_at)

        steps = Array.new(step_count) do |i|
          step = create(:conversation_turn_step,
                        household: household,
                        conversation_turn_id: turn.conversation_turn_id,
                        step_index: i)
          step.update_columns(created_at: created_at)
          step
        end

        { turn: turn, steps: steps }
      end
    end

    it 'deletes turns older than 180 days and their steps' do
      old_data = create_turn_with_steps(
        household: household_a,
        created_at: 181.days.ago,
        step_count: 2
      )

      expect { Rake::Task['transcripts:purge'].invoke }
        .to output(/Deleted 1 turn\(s\) and 2 step\(s\)/).to_stdout

      expect(ConversationTurn.exists?(old_data[:turn].id)).to be false
      old_data[:steps].each do |step|
        expect(ConversationTurnStep.exists?(step.id)).to be false
      end
    end

    it 'retains turns created within the retention window (179 days ago is not older than 180)' do
      boundary_data = create_turn_with_steps(
        household: household_a,
        created_at: 179.days.ago,
        step_count: 1
      )

      expect { Rake::Task['transcripts:purge'].invoke }
        .to output(/Deleted 0 turn\(s\) and 0 step\(s\)/).to_stdout

      expect(ConversationTurn.exists?(boundary_data[:turn].id)).to be true
      expect(ConversationTurnStep.exists?(boundary_data[:steps].first.id)).to be true
    end

    it 'retains recent turns (created today)' do
      recent_data = create_turn_with_steps(
        household: household_a,
        created_at: Time.current,
        step_count: 1
      )

      expect { Rake::Task['transcripts:purge'].invoke }
        .to output(/Deleted 0 turn\(s\) and 0 step\(s\)/).to_stdout

      expect(ConversationTurn.exists?(recent_data[:turn].id)).to be true
      expect(ConversationTurnStep.exists?(recent_data[:steps].first.id)).to be true
    end

    it 'purges across all households (cross-tenant coverage)' do
      old_a = create_turn_with_steps(household: household_a, created_at: 200.days.ago)
      old_b = create_turn_with_steps(household: household_b, created_at: 200.days.ago)
      recent_a = create_turn_with_steps(household: household_a, created_at: 1.day.ago)

      expect { Rake::Task['transcripts:purge'].invoke }
        .to output(/Deleted 2 turn\(s\)/).to_stdout

      # Both old turns deleted regardless of household
      expect(ConversationTurn.exists?(old_a[:turn].id)).to be false
      expect(ConversationTurn.exists?(old_b[:turn].id)).to be false

      # Recent turn from household_a retained
      expect(ConversationTurn.exists?(recent_a[:turn].id)).to be true
    end

    it 'does not touch llm_usage_records' do
      create_turn_with_steps(household: household_a, created_at: 200.days.ago)

      llm_record = ActsAsTenant.with_tenant(household_a) do
        create(:llm_usage_record, household: household_a)
      end

      expect { Rake::Task['transcripts:purge'].invoke }
        .to output(/Deleted 1 turn\(s\)/).to_stdout

      expect(LlmUsageRecord.exists?(llm_record.id)).to be true
    end

    it 'is safe to run on an empty table (no turns)' do
      expect { Rake::Task['transcripts:purge'].invoke }
        .to output(/Deleted 0 turn\(s\) and 0 step\(s\)/).to_stdout
    end

    it 'prints the cutoff date before purging' do
      expect { Rake::Task['transcripts:purge'].invoke }
        .to output(/Purging conversation turns created before/).to_stdout
    end
  end
end
