import type { LlmUsageRecordData, LlmUsageSummary } from '../../app/llm-usage/llmUsage.types';

let nextId = 1;

export function buildLlmUsageRecord(overrides?: Partial<LlmUsageRecordData>): LlmUsageRecordData {
  return {
    id: nextId++,
    llm_model_id: 1,
    usage_category: 'chat',
    conversation_id: 'conv-abc',
    conversation_turn_id: 'turn-1',
    input_tokens: 100,
    output_tokens: 50,
    cache_read_tokens: 0,
    cache_write_tokens: 0,
    thinking_tokens: 0,
    total_tokens: 150,
    request_duration_ms: 1200,
    incomplete: false,
    tool_call_count: 0,
    tool_calls_detail: [],
    extras: {},
    total_cost: 30,
    provider: 'anthropic',
    llm_model_name: 'claude-sonnet-4-6',
    created_at: '2026-05-24T10:00:00.000Z',
    ...overrides,
  };
}

export function buildLlmUsageSummary(overrides?: Partial<LlmUsageSummary>): LlmUsageSummary {
  return {
    total_records: 10,
    total_tokens: 5000,
    total_cost: 125,
    by_provider: [{ provider: 'anthropic', total_tokens: 5000, total_cost: 125 }],
    by_category: [{ usage_category: 'chat', total_tokens: 5000, total_cost: 125 }],
    ...overrides,
  };
}
