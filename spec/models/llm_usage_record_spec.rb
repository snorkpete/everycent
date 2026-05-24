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
