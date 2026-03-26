export type MatchType = 'exact' | 'contains';

export interface AutoAllocateSuggestion {
  allocation_id: number;
  allocation_name: string;
  match_type: MatchType;
}

export interface AutoAllocateResponse {
  suggestions: (AutoAllocateSuggestion | null)[];
}
