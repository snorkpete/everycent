
export interface SinkFundAllocationData {
  id?: number;
  name?: string;
  amount?: number;
  bank_account_id?: number;
  comment: string;
  spent?: number;
  remaining?: number;
  status: string;
  target?: number;
  current_balance?: number;
  difference?: number;
}
