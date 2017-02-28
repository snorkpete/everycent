
export interface SinkFundData {
  id?: number;
  name?: string;
  account_type?: string;
  account_type_description?: string;
  account_category?: string;
  account_no?: number;
  institution_id?: number;
  opening_balance?: 2943550;
  closing_balance?: 2461209;
  current_balance?: 3363510;
  sink_fund_allocation_balance?: 3160000;
  is_sink_fund?: boolean;
  institution?: { id: number, name: string };
  sink_fund_allocations?: SinkFundData[];
};
