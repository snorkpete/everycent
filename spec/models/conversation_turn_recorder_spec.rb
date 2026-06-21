require 'rails_helper'

RSpec.describe ConversationTurnRecorder do
  let(:household) { create(:household) }
  let(:llm_model) do
    ActsAsTenant.with_tenant(household) do
      create(:llm_model,
        household: household,
        provider: 'anthropic',
        name: 'claude-sonnet-4-5',
        input_token_cost: 300.0,
        output_token_cost: 1500.0,
        cache_read_token_cost: 30.0,
        cache_write_token_cost: 375.0,
        thinking_token_cost: 1500.0
      )
    end
  end

  let(:conversation_id) { SecureRandom.uuid }
  let(:conversation_turn_id) { SecureRandom.uuid }

  let(:base_dto) do
    {
      llm_model_id: llm_model.id,
      conversation_id: conversation_id,
      conversation_turn_id: conversation_turn_id,
      user_prompt: 'How much did I spend on groceries?',
      final_output: 'You spent $342 on groceries.',
      steps: [
        {
          thinking: 'Let me look up grocery spending...',
          tool_calls: [{ name: 'analyze_overspending', params: {}, result: { total: 34200 } }],
          usage: {
            usage_category: 'chat',
            input_tokens: 1200,
            output_tokens: 350,
            cache_read_tokens: 0,
            cache_write_tokens: 0,
            thinking_tokens: 0,
            request_duration_ms: 4200,
            incomplete: false,
            tool_call_count: 1,
            tool_calls_detail: [{ name: 'analyze_overspending', duration_ms: 145 }],
            extras: {}
          }
        }
      ]
    }
  end

  describe '.record' do
    context 'with a valid single-step turn' do
      it 'writes all three tables in one transaction' do
        expect {
          ConversationTurnRecorder.record(base_dto, household: household)
        }.to change(ConversationTurn, :count).by(1)
          .and change(ConversationTurnStep, :count).by(1)
          .and change(LlmUsageRecord, :count).by(1)
      end

      it 'persists the turn with correct attributes' do
        ConversationTurnRecorder.record(base_dto, household: household)

        turn = ConversationTurn.last
        expect(turn.conversation_turn_id).to eq conversation_turn_id
        expect(turn.conversation_id).to eq conversation_id
        expect(turn.user_prompt).to eq 'How much did I spend on groceries?'
        expect(turn.final_output).to eq 'You spent $342 on groceries.'
        expect(turn.incomplete).to be false
      end

      it 'persists the step with correct attributes and step_index 0' do
        ConversationTurnRecorder.record(base_dto, household: household)

        step = ConversationTurnStep.last
        expect(step.conversation_turn_id).to eq conversation_turn_id
        expect(step.step_index).to eq 0
        expect(step.thinking).to eq 'Let me look up grocery spending...'
        expect(step.tool_calls).to eq [{ 'name' => 'analyze_overspending', 'params' => {}, 'result' => { 'total' => 34200 } }]
      end

      it 'persists the usage record with step_index 0' do
        ConversationTurnRecorder.record(base_dto, household: household)

        usage = LlmUsageRecord.last
        expect(usage.conversation_turn_id).to eq conversation_turn_id
        expect(usage.step_index).to eq 0
        expect(usage.input_tokens).to eq 1200
        expect(usage.output_tokens).to eq 350
      end

      it 'scopes all records to the household' do
        ConversationTurnRecorder.record(base_dto, household: household)

        ActsAsTenant.with_tenant(household) do
          expect(ConversationTurn.count).to eq 1
          expect(ConversationTurnStep.count).to eq 1
          expect(LlmUsageRecord.count).to eq 1
        end
      end
    end

    context 'with a multi-step turn' do
      let(:multi_step_dto) do
        base_dto.merge(
          steps: [
            {
              thinking: 'First thinking...',
              tool_calls: [{ name: 'tool_a', params: {}, result: {} }],
              usage: {
                usage_category: 'chat',
                input_tokens: 100,
                output_tokens: 50,
                cache_read_tokens: 0,
                cache_write_tokens: 0,
                thinking_tokens: 0,
                request_duration_ms: 1000,
                incomplete: false,
                tool_call_count: 1,
                tool_calls_detail: [],
                extras: {}
              }
            },
            {
              thinking: 'Second thinking...',
              tool_calls: [],
              usage: {
                usage_category: 'chat',
                input_tokens: 200,
                output_tokens: 100,
                cache_read_tokens: 0,
                cache_write_tokens: 0,
                thinking_tokens: 0,
                request_duration_ms: 2000,
                incomplete: false,
                tool_call_count: 0,
                tool_calls_detail: [],
                extras: {}
              }
            },
            {
              thinking: nil,
              tool_calls: [],
              usage: {
                usage_category: 'chat',
                input_tokens: 300,
                output_tokens: 150,
                cache_read_tokens: 0,
                cache_write_tokens: 0,
                thinking_tokens: 0,
                request_duration_ms: 3000,
                incomplete: false,
                tool_call_count: 0,
                tool_calls_detail: [],
                extras: {}
              }
            }
          ]
        )
      end

      it 'writes all three tables with correct counts' do
        expect {
          ConversationTurnRecorder.record(multi_step_dto, household: household)
        }.to change(ConversationTurn, :count).by(1)
          .and change(ConversationTurnStep, :count).by(3)
          .and change(LlmUsageRecord, :count).by(3)
      end

      it 'assigns step_index from array position to step rows' do
        ConversationTurnRecorder.record(multi_step_dto, household: household)

        steps = ActsAsTenant.with_tenant(household) do
          ConversationTurnStep.where(conversation_turn_id: conversation_turn_id)
                              .order(:step_index)
        end

        expect(steps.map(&:step_index)).to eq [0, 1, 2]
      end

      it 'assigns step_index from array position to usage rows, matching step rows' do
        ConversationTurnRecorder.record(multi_step_dto, household: household)

        usage_indices = ActsAsTenant.with_tenant(household) do
          LlmUsageRecord.where(conversation_turn_id: conversation_turn_id)
                        .order(:step_index)
                        .pluck(:step_index)
        end

        expect(usage_indices).to eq [0, 1, 2]
      end

      it 'step_index values are identical between step rows and usage rows' do
        ConversationTurnRecorder.record(multi_step_dto, household: household)

        ActsAsTenant.with_tenant(household) do
          step_indices = ConversationTurnStep
            .where(conversation_turn_id: conversation_turn_id)
            .order(:step_index).pluck(:step_index)

          usage_indices = LlmUsageRecord
            .where(conversation_turn_id: conversation_turn_id)
            .order(:step_index).pluck(:step_index)

          expect(step_indices).to eq usage_indices
        end
      end
    end

    context 'incomplete derivation' do
      it 'marks turn incomplete when any step usage is incomplete' do
        dto = base_dto.deep_merge(steps: [base_dto[:steps][0].deep_merge(usage: { incomplete: true })])
        ConversationTurnRecorder.record(dto, household: household)

        expect(ConversationTurn.last.incomplete).to be true
      end

      it 'marks turn complete when all step usages are complete' do
        ConversationTurnRecorder.record(base_dto, household: household)
        expect(ConversationTurn.last.incomplete).to be false
      end

      it 'marks turn incomplete when the last step is incomplete (multi-step)' do
        dto = base_dto.merge(
          steps: [
            base_dto[:steps][0],
            base_dto[:steps][0].deep_merge(usage: { incomplete: true })
          ]
        )
        ConversationTurnRecorder.record(dto, household: household)
        expect(ConversationTurn.last.incomplete).to be true
      end
    end

    context 'when final_output is nil (interrupted turn)' do
      it 'persists the turn without final_output' do
        dto = base_dto.merge(final_output: nil)
        ConversationTurnRecorder.record(dto, household: household)

        expect(ConversationTurn.last.final_output).to be_nil
      end
    end

    context 'transaction rollback' do
      it 'rolls back all three tables when a step has invalid usage data' do
        dto = base_dto.deep_merge(
          steps: [base_dto[:steps][0].deep_merge(usage: { usage_category: 'invalid_category' })]
        )

        turns_before  = ConversationTurn.count
        steps_before  = ConversationTurnStep.count
        usage_before  = LlmUsageRecord.count

        expect {
          ConversationTurnRecorder.record(dto, household: household)
        }.to raise_error(ActiveRecord::RecordInvalid)

        ActsAsTenant.with_tenant(household) do
          expect(ConversationTurn.count).to eq turns_before
          expect(ConversationTurnStep.count).to eq steps_before
          expect(LlmUsageRecord.count).to eq usage_before
        end
      end
    end

    context 'tenant isolation' do
      it 'does not write records to another household' do
        other_household = create(:household)
        other_model = ActsAsTenant.with_tenant(other_household) do
          create(:llm_model, household: other_household, provider: 'openai', name: 'gpt-4')
        end

        # Record for other_household
        dto = base_dto.merge(llm_model_id: other_model.id)
        ConversationTurnRecorder.record(dto, household: other_household)

        # Current household sees nothing
        ActsAsTenant.with_tenant(household) do
          expect(ConversationTurn.count).to eq 0
          expect(ConversationTurnStep.count).to eq 0
          expect(LlmUsageRecord.count).to eq 0
        end
      end

      it 'raises ActiveRecord::RecordNotFound for a model from another household' do
        other_household = create(:household)
        other_model = ActsAsTenant.with_tenant(other_household) do
          create(:llm_model, household: other_household, provider: 'openai', name: 'gpt-4')
        end

        dto = base_dto.merge(llm_model_id: other_model.id)

        expect {
          ConversationTurnRecorder.record(dto, household: household)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when llm_model_id is not found' do
      it 'raises ActiveRecord::RecordNotFound' do
        dto = base_dto.merge(llm_model_id: 99999)
        expect {
          ConversationTurnRecorder.record(dto, household: household)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when required fields are missing' do
      it 'raises InvalidPayloadError for missing user_prompt' do
        dto = base_dto.except(:user_prompt)
        expect {
          ConversationTurnRecorder.record(dto, household: household)
        }.to raise_error(ConversationTurnRecorder::InvalidPayloadError)
      end

      it 'raises InvalidPayloadError for missing steps' do
        dto = base_dto.except(:steps)
        expect {
          ConversationTurnRecorder.record(dto, household: household)
        }.to raise_error(ConversationTurnRecorder::InvalidPayloadError)
      end
    end
  end

  describe 'backfill correctness (unique step_index per turn)' do
    it 'produces unique step_index values within a turn for existing records' do
      # Simulate what pre-migration rows look like: multiple usage records
      # sharing a conversation_turn_id but each getting step_index from array position
      turn_id = SecureRandom.uuid
      conv_id = SecureRandom.uuid

      dto = {
        llm_model_id: llm_model.id,
        conversation_id: conv_id,
        conversation_turn_id: turn_id,
        user_prompt: 'Multi-step query',
        final_output: 'Done',
        steps: [
          {
            thinking: nil,
            tool_calls: [{ name: 'tool_a', params: {}, result: {} }],
            usage: { usage_category: 'chat', input_tokens: 10, output_tokens: 5,
                     cache_read_tokens: 0, cache_write_tokens: 0, thinking_tokens: 0,
                     request_duration_ms: 100, incomplete: false, tool_call_count: 1,
                     tool_calls_detail: [], extras: {} }
          },
          {
            thinking: nil,
            tool_calls: [],
            usage: { usage_category: 'chat', input_tokens: 20, output_tokens: 10,
                     cache_read_tokens: 0, cache_write_tokens: 0, thinking_tokens: 0,
                     request_duration_ms: 200, incomplete: false, tool_call_count: 0,
                     tool_calls_detail: [], extras: {} }
          }
        ]
      }

      ConversationTurnRecorder.record(dto, household: household)

      ActsAsTenant.with_tenant(household) do
        usage_records = LlmUsageRecord.where(conversation_turn_id: turn_id).order(:step_index)
        expect(usage_records.map(&:step_index)).to eq [0, 1]
        # Confirm uniqueness
        expect(usage_records.map(&:step_index).uniq.size).to eq usage_records.size
      end
    end
  end
end
