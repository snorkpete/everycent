export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
}

export interface ToolCallDetail {
  name: string;
  duration_ms: number;
}

export interface NormalizedUsage {
  // Token counts as reported by Ollama (OpenAI-compatible)
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  thinking_tokens: number;
  total_tokens: number;
  // Request-level metrics tracked by us
  request_duration_ms: number;
  tool_call_count: number;
  tool_calls_detail: ToolCallDetail[];
  // Mark when stream was interrupted and we couldn't capture full usage
  incomplete: boolean;
}

export interface UsageEvent {
  type: 'usage';
  usage: NormalizedUsage;
}
