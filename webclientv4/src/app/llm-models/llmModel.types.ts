export interface LlmModelData {
  id?: number;
  provider?: string;
  name?: string;
  display_name?: string;
  input_token_cost?: number;
  output_token_cost?: number;
  cache_read_token_cost?: number;
  cache_write_token_cost?: number;
  thinking_token_cost?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}
