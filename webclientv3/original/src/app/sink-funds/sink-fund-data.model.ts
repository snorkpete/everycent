
import {SinkFundAllocationData} from './sink-fund-allocation-data.model';
export interface SinkFundData {
  id?: number;
  name?: string;
  account_type?: string;
  account_type_description?: string;
  account_category?: string;
  account_no?: number;
  institution_id?: number;
  opening_balance?: number;
  closing_balance?: number;
  current_balance?: number;
  sink_fund_allocation_balance?: number;
  is_sink_fund?: boolean;
  institution?: { id: number, name: string };
  sink_fund_allocations?: SinkFundAllocationData[];
};
