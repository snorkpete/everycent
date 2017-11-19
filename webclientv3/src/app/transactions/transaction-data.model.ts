import {SinkFundAllocationData} from '../sink-funds/sink-fund-allocation-data.model';
export interface TransactionData {
  id?: number;
  description?: string;
  bank_ref?: string,
  bank_account_id?: number;
  transaction_date?: string|Date;
  withdrawal_amount?: number;
  deposit_amount?: number;
  payee_id?: number;
  payee_code?: string;
  payee_name?: string;
  allocation_id?: number;
  sink_fund_allocation_id?: number;
  status?: string;
  net_amount?: number;
  brought_forward_status?: string;
  allocation?: any;
  sink_fund_allocation?: SinkFundAllocationData;
}
