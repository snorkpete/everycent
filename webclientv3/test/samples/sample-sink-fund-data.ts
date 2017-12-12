
import {SinkFundData} from '../../src/app/sink-funds/sink-fund-data.model';

let SampleSinkFundData: SinkFundData = {
        id: 12,
        name: "Sink Savings",
        account_type: "sink_fund",
        account_type_description: "Joint Savings",
        account_category: "current",
        account_no: null,
        institution_id: 1,
        opening_balance: 2943550,
        closing_balance: 2461209,
        current_balance: 3363510,
        sink_fund_allocation_balance: 3160000,
        is_sink_fund: true,
        institution: {
          id: 1,
          name: "Scotia Bank",
        },
        sink_fund_allocations: [
          {
            id: 29,
            name: "ACCA Fees",
            amount: 210000,
            bank_account_id: 12,
            comment: null,
            spent: 0,
            remaining: 210000,
            status: "open",
            target: 210000,
            current_balance: 0,
            difference: 210000
          },
          {
            id: 35,
            name: "Aidan Camp",
            amount: 200000,
            bank_account_id: 12,
            comment: null,
            spent: -30000,
            remaining: 230000,
            status: "open",
            target: 200000,
            current_balance: 30000,
            difference: 170000
          },
        ]
      };

export {SampleSinkFundData};
