export type ChatMode = 'nlq' | 'bug-report';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  turnId?: string;
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

// ---------------------------------------------------------------------------
// Conversation-turn DTO — assembled per turn and POSTed to /mcp/conversation_turns
// ---------------------------------------------------------------------------

/** One tool call within a step: the name, parsed params, and the result string */
export interface StepToolCall {
  name: string;
  params: Record<string, unknown>;
  result: string;
}

/** Usage data for one step — mirrors llm_usage_record columns that the backend expects */
export interface StepUsage {
  usage_category: 'chat';
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  thinking_tokens: number;
  request_duration_ms: number;
  incomplete: boolean;
  tool_call_count: number;
  tool_calls_detail: ToolCallDetail[];
  extras: Record<string, unknown>;
}

/** One inner LLM call within a turn (thinking + tool interactions + usage) */
export interface ConversationTurnStep {
  thinking: string;
  tool_calls: StepToolCall[];
  usage: StepUsage;
}

/** Full payload for POST /mcp/conversation_turns */
export interface ConversationTurnDto {
  llm_model_id: number;
  conversation_id: string;
  conversation_turn_id: string;
  user_prompt: string;
  final_output: string | null;
  steps: ConversationTurnStep[];
}
