require 'rails_helper'

RSpec.describe LlmUsageRecord, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
    @llm_model = create(:llm_model)
  end

  it 'is valid with required attributes' do
    record = build(:llm_usage_record, household: @household, llm_model: @llm_model)
    expect(record).to be_valid
  end

  describe 'validations' do
    it 'is invalid without a usage_category' do
      record = build(:llm_usage_record, usage_category: nil)
      expect(record).not_to be_valid
      expect(record.errors[:usage_category]).to be_present
    end

    it 'is invalid with an unrecognised usage_category' do
      record = build(:llm_usage_record, usage_category: 'unknown')
      expect(record).not_to be_valid
      expect(record.errors[:usage_category]).to be_present
    end

    it 'accepts all valid usage_categories' do
      %w[chat query_embedding background_embedding].each do |category|
        record = build(:llm_usage_record, usage_category: category)
        expect(record).to be_valid, "expected #{category} to be valid"
      end
    end

    it 'is invalid without a conversation_id' do
      record = build(:llm_usage_record, conversation_id: nil)
      expect(record).not_to be_valid
      expect(record.errors[:conversation_id]).to be_present
    end

    it 'is invalid without a conversation_turn_id' do
      record = build(:llm_usage_record, conversation_turn_id: nil)
      expect(record).not_to be_valid
      expect(record.errors[:conversation_turn_id]).to be_present
    end

    it 'is invalid without a provider' do
      record = build(:llm_usage_record, provider: nil)
      expect(record).not_to be_valid
      expect(record.errors[:provider]).to be_present
    end

    it 'is invalid without a llm_model_name' do
      record = build(:llm_usage_record, llm_model_name: nil)
      expect(record).not_to be_valid
      expect(record.errors[:llm_model_name]).to be_present
    end
  end

  describe 'associations' do
    it 'belongs to an llm_model' do
      record = build(:llm_usage_record)
      expect(record.llm_model).to be_a(LlmModel)
    end

    it 'is invalid without an llm_model' do
      record = build(:llm_usage_record, llm_model: nil)
      expect(record).not_to be_valid
    end
  end

  describe 'tenant scoping' do
    it 'scopes records to the current household' do
      create(:llm_usage_record, household: @household, llm_model: @llm_model)

      second_household = create(:household)
      ActsAsTenant.with_tenant(second_household) do
        other_model = create(:llm_model, household: second_household)
        create(:llm_usage_record, household: second_household, llm_model: other_model)
      end

      expect(LlmUsageRecord.count).to eq 1
    end
  end

  describe 'scopes' do
    describe '.recent_first' do
      it 'orders records newest first' do
        old_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        new_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        old_record.update_columns(created_at: 2.days.ago)

        expect(LlmUsageRecord.recent_first.first).to eq new_record
        expect(LlmUsageRecord.recent_first.last).to eq old_record
      end
    end

    describe '.on_or_after' do
      it 'includes records on or after the given date' do
        old_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        new_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        old_record.update_columns(created_at: Date.new(2026, 3, 1).beginning_of_day)
        new_record.update_columns(created_at: Date.new(2026, 5, 1).beginning_of_day)

        results = LlmUsageRecord.on_or_after(Date.new(2026, 4, 1))
        expect(results).to include(new_record)
        expect(results).not_to include(old_record)
      end
    end

    describe '.on_or_before' do
      it 'includes records on or before the given date' do
        old_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        new_record = create(:llm_usage_record, household: @household, llm_model: @llm_model)
        old_record.update_columns(created_at: Date.new(2026, 3, 1).beginning_of_day)
        new_record.update_columns(created_at: Date.new(2026, 5, 1).beginning_of_day)

        results = LlmUsageRecord.on_or_before(Date.new(2026, 4, 30))
        expect(results).to include(old_record)
        expect(results).not_to include(new_record)
      end
    end
  end

  describe '.build_from_model' do
    it 'copies cost rates from the llm_model' do
      record = LlmUsageRecord.build_from_model(@llm_model, {
        usage_category: 'chat',
        conversation_id: SecureRandom.uuid,
        conversation_turn_id: SecureRandom.uuid
      })

      expect(record.input_token_cost_rate).to eq BigDecimal('300.0')
      expect(record.output_token_cost_rate).to eq BigDecimal('1500.0')
      expect(record.cache_read_token_cost_rate).to eq BigDecimal('30.0')
      expect(record.cache_write_token_cost_rate).to eq BigDecimal('375.0')
      expect(record.thinking_token_cost_rate).to eq BigDecimal('1500.0')
    end

    it 'copies provider and llm_model_name from the llm_model' do
      record = LlmUsageRecord.build_from_model(@llm_model, {
        usage_category: 'chat',
        conversation_id: SecureRandom.uuid,
        conversation_turn_id: SecureRandom.uuid
      })

      expect(record.provider).to eq 'anthropic'
      expect(record.llm_model_name).to eq 'claude-sonnet-4-5'
    end

    it 'computes total_tokens as sum of all token types' do
      record = LlmUsageRecord.build_from_model(@llm_model, {
        usage_category: 'chat',
        conversation_id: SecureRandom.uuid,
        conversation_turn_id: SecureRandom.uuid,
        input_tokens: 1000,
        output_tokens: 200,
        cache_read_tokens: 50,
        cache_write_tokens: 25,
        thinking_tokens: 10
      })

      expect(record.total_tokens).to eq 1285
    end

    it 'computes total_cost correctly' do
      record = LlmUsageRecord.build_from_model(@llm_model, {
        usage_category: 'chat',
        conversation_id: SecureRandom.uuid,
        conversation_turn_id: SecureRandom.uuid,
        input_tokens: 1200,
        output_tokens: 350,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        thinking_tokens: 0
      })

      # (1200 * 300 + 350 * 1500) / 1_000_000 = 885_000 / 1_000_000 = 0.885
      expect(record.total_cost).to eq BigDecimal('0.885')
    end

    it 'fills in defaults for optional fields when absent' do
      record = LlmUsageRecord.build_from_model(@llm_model, {
        usage_category: 'chat',
        conversation_id: SecureRandom.uuid,
        conversation_turn_id: SecureRandom.uuid
      })

      expect(record.incomplete).to eq false
      expect(record.tool_call_count).to eq 0
      expect(record.tool_calls_detail).to eq []
      expect(record.extras).to eq({})
    end

    it 'returns an unsaved record' do
      record = LlmUsageRecord.build_from_model(@llm_model, {
        usage_category: 'chat',
        conversation_id: SecureRandom.uuid,
        conversation_turn_id: SecureRandom.uuid
      })

      expect(record).to be_new_record
    end
  end

  describe '.create_batch!' do
    let(:base_attrs) do
      {
        usage_category: 'chat',
        conversation_id: SecureRandom.uuid,
        conversation_turn_id: SecureRandom.uuid,
        input_tokens: 100,
        output_tokens: 50
      }
    end

    it 'saves all records and returns them' do
      records = LlmUsageRecord.create_batch!(
        llm_model: @llm_model,
        records: [base_attrs, base_attrs.merge(conversation_turn_id: SecureRandom.uuid)]
      )

      expect(records.size).to eq 2
      expect(records).to all(be_persisted)
    end

    it 'rolls back the entire batch when any record fails validation' do
      invalid_attrs = base_attrs.merge(usage_category: 'invalid_category')

      expect {
        begin
          LlmUsageRecord.create_batch!(
            llm_model: @llm_model,
            records: [base_attrs, invalid_attrs]
          )
        rescue ActiveRecord::RecordInvalid
          nil
        end
      }.not_to change(LlmUsageRecord, :count)
    end

    it 'raises ActiveRecord::RecordInvalid when a record fails validation' do
      invalid_attrs = base_attrs.merge(usage_category: 'invalid_category')

      expect {
        LlmUsageRecord.create_batch!(
          llm_model: @llm_model,
          records: [base_attrs, invalid_attrs]
        )
      }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe '.summary_for' do
    it 'returns zero totals when the scope is empty' do
      summary = LlmUsageRecord.summary_for(LlmUsageRecord.all)

      expect(summary[:total_records]).to eq 0
      expect(summary[:total_tokens]).to eq 0
      expect(summary[:by_provider]).to eq []
      expect(summary[:by_category]).to eq []
    end

    it 'aggregates total_records, total_tokens, and total_cost' do
      create(:llm_usage_record, household: @household, llm_model: @llm_model,
        total_tokens: 1550, total_cost: '0.885')
      create(:llm_usage_record, household: @household, llm_model: @llm_model,
        total_tokens: 2000, total_cost: '1.200')

      summary = LlmUsageRecord.summary_for(LlmUsageRecord.all)

      expect(summary[:total_records]).to eq 2
      expect(summary[:total_tokens]).to eq 3550
      expect(summary[:total_cost].to_f).to be_within(0.0001).of(2.085)
    end

    it 'groups by provider' do
      create(:llm_usage_record, household: @household, llm_model: @llm_model,
        provider: 'anthropic', total_tokens: 1000, total_cost: '0.5')

      local_model = create(:llm_model,
        household: @household,
        provider: 'ollama',
        name: 'qwen3:14b',
        input_token_cost: 0,
        output_token_cost: 0,
        cache_read_token_cost: 0,
        cache_write_token_cost: 0,
        thinking_token_cost: 0
      )
      create(:llm_usage_record, household: @household, llm_model: local_model,
        provider: 'ollama', llm_model_name: 'qwen3:14b', total_tokens: 5000, total_cost: '0.0')

      summary = LlmUsageRecord.summary_for(LlmUsageRecord.all)

      anthropic = summary[:by_provider].find { |p| p[:provider] == 'anthropic' }
      ollama    = summary[:by_provider].find { |p| p[:provider] == 'ollama' }

      expect(anthropic[:total_tokens]).to eq 1000
      expect(ollama[:total_tokens]).to eq 5000
      expect(ollama[:total_cost].to_f).to eq 0.0
    end

    it 'groups by usage_category' do
      create(:llm_usage_record, household: @household, llm_model: @llm_model,
        usage_category: 'chat', total_tokens: 1000, total_cost: '0.5')
      create(:llm_usage_record, household: @household, llm_model: @llm_model,
        usage_category: 'query_embedding', total_tokens: 500, total_cost: '0.05')

      summary = LlmUsageRecord.summary_for(LlmUsageRecord.all)

      chat      = summary[:by_category].find { |c| c[:usage_category] == 'chat' }
      embedding = summary[:by_category].find { |c| c[:usage_category] == 'query_embedding' }

      expect(chat[:total_tokens]).to eq 1000
      expect(embedding[:total_tokens]).to eq 500
    end

    it 'respects a pre-filtered scope' do
      old_record = create(:llm_usage_record, household: @household, llm_model: @llm_model,
        total_tokens: 1000, total_cost: '0.3')
      create(:llm_usage_record, household: @household, llm_model: @llm_model,
        total_tokens: 2000, total_cost: '0.6')
      old_record.update_columns(created_at: Date.new(2026, 3, 1).beginning_of_day)

      scope = LlmUsageRecord.on_or_before(Date.new(2026, 4, 30))
      summary = LlmUsageRecord.summary_for(scope)

      expect(summary[:total_records]).to eq 1
      expect(summary[:total_tokens]).to eq 1000
    end
  end

  describe '.compute_total_cost' do
    it 'computes total cost from token counts and rates' do
      cost = LlmUsageRecord.compute_total_cost(
        input_tokens: 1_000_000,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        thinking_tokens: 0,
        input_token_cost_rate: BigDecimal('300.0'),
        output_token_cost_rate: BigDecimal('1500.0'),
        cache_read_token_cost_rate: BigDecimal('30.0'),
        cache_write_token_cost_rate: BigDecimal('375.0'),
        thinking_token_cost_rate: BigDecimal('1500.0')
      )
      # 1_000_000 * 300 / 1_000_000 = 300 cents
      expect(cost).to eq BigDecimal('300')
    end

    it 'sums all token types correctly' do
      cost = LlmUsageRecord.compute_total_cost(
        input_tokens: 1200,
        output_tokens: 350,
        cache_read_tokens: 500,
        cache_write_tokens: 100,
        thinking_tokens: 200,
        input_token_cost_rate: BigDecimal('300.0'),
        output_token_cost_rate: BigDecimal('1500.0'),
        cache_read_token_cost_rate: BigDecimal('30.0'),
        cache_write_token_cost_rate: BigDecimal('375.0'),
        thinking_token_cost_rate: BigDecimal('1500.0')
      )
      # (1200*300 + 350*1500 + 500*30 + 100*375 + 200*1500) / 1_000_000
      # = (360_000 + 525_000 + 15_000 + 37_500 + 300_000) / 1_000_000
      # = 1_237_500 / 1_000_000 = 1.2375
      expect(cost).to eq BigDecimal('1.2375')
    end

    it 'returns zero when all token counts are zero' do
      cost = LlmUsageRecord.compute_total_cost(
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        thinking_tokens: 0,
        input_token_cost_rate: BigDecimal('300.0'),
        output_token_cost_rate: BigDecimal('1500.0'),
        cache_read_token_cost_rate: BigDecimal('30.0'),
        cache_write_token_cost_rate: BigDecimal('375.0'),
        thinking_token_cost_rate: BigDecimal('1500.0')
      )
      expect(cost).to eq 0
    end

    it 'returns zero when all rates are zero (e.g. local model)' do
      cost = LlmUsageRecord.compute_total_cost(
        input_tokens: 10_000,
        output_tokens: 5_000,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        thinking_tokens: 0,
        input_token_cost_rate: BigDecimal('0'),
        output_token_cost_rate: BigDecimal('0'),
        cache_read_token_cost_rate: BigDecimal('0'),
        cache_write_token_cost_rate: BigDecimal('0'),
        thinking_token_cost_rate: BigDecimal('0')
      )
      expect(cost).to eq 0
    end

    it 'preserves sub-cent precision' do
      # 1 token at 300 cents/million = 0.0003 cents
      cost = LlmUsageRecord.compute_total_cost(
        input_tokens: 1,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        thinking_tokens: 0,
        input_token_cost_rate: BigDecimal('300.0'),
        output_token_cost_rate: BigDecimal('0'),
        cache_read_token_cost_rate: BigDecimal('0'),
        cache_write_token_cost_rate: BigDecimal('0'),
        thinking_token_cost_rate: BigDecimal('0')
      )
      expect(cost).to eq BigDecimal('0.0003')
    end
  end
end
