export interface AccountTransferData {
  to: number;
  from: number;
  from_allocation?: number;
  to_allocation?: number;
  from_sink_fund_allocation?: number;
  to_sink_fund_allocation?: number;
  amount: number;
  description?: string;
  date?: string | Date;
  budget_id?: number;
}
