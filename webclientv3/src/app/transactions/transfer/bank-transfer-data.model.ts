export interface BankTransferData {
  to: number;
  from: number;
  from_allocation_id?: number;
  to_allocation_id?: number;
  from_sink_fund_allocation_id?: number;
  to_sink_fund_allocation_id?: number;
  amount: number;
  description?: string;
  date?: string | Date;
}
