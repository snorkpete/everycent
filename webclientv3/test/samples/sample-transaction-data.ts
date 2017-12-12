import {AllocationData} from "../../src/app/transactions/allocation-data.model";
import {TransactionData} from "../../src/app/transactions/transaction-data.model";
import {SampleBankAccountData} from "./sample-bank-account-data";

let SampleAllocationData: AllocationData = {
  id: 52,
  name: "Water",
  amount: 5000,
  budget_id: 5,
  spent: 2438,
  allocation_category_id: 3,
  allocation_type: null,
  is_standing_order: null,
  bank_account_id: null,
  comment: "Estimated €25 (2months)",
  allocation_category: {

  },
  bank_account: SampleBankAccountData
};

let SampleTransactionData: TransactionData = {
  id: 1500,
  description: "VITENS NV - WATER",
  bank_account_id: 1,
  transaction_date: "2017-11-25",
  withdrawal_amount: 2438,
  deposit_amount: 0,
  allocation_id: 52,
  sink_fund_allocation_id: null,
  status: "paid",
  paid: true,
  net_amount: -2438,
  brought_forward_status: null,
  allocation: SampleAllocationData,
  bank_account: SampleBankAccountData,
};


export {SampleTransactionData};
