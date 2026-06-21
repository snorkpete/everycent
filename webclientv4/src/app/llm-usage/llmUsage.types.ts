// ToolCallDetail is intentionally duplicated from chat.types.ts.
// The chat-side type is part of internal event plumbing and may gain telemetry fields
// that don't belong in the API contract. Keeping them separate avoids coupling
// the chat module to the persistence layer.
export interface ToolCallDetail {
  name: string;
  duration_ms: number;
}

export interface LlmUsageRecordData {
  id?: number;
  llm_model_id: number;
  usage_category: 'chat' | 'query_embedding' | 'background_embedding';
  conversation_id: string;
  conversation_turn_id: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  thinking_tokens: number;
  total_tokens: number;
  request_duration_ms: number;
  incomplete: boolean;
  tool_call_count: number;
  tool_calls_detail: ToolCallDetail[];
  extras: Record<string, unknown>;
  // Read-only fields from server
  total_cost?: number;
  provider?: string;
  llm_model_name?: string;
  created_at?: string;
}

export interface LlmUsageSummary {
  total_records: number;
  total_tokens: number;
  total_cost: number;
  by_provider: Array<{ provider: string; total_tokens: number; total_cost: number }>;
  by_category: Array<{ usage_category: string; total_tokens: number; total_cost: number }>;
}

export interface UsagePageParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
}

export interface UsagePageResponse {
  records: LlmUsageRecordData[];
  total_count: number;
}
