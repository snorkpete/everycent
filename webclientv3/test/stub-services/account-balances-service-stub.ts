import { of } from "rxjs";

const AccountBalancesServiceStub = {
  getAccountBalances$: _ => of([]),
  totalAssets: (_) => [],
  totalLiabilities: (_) => [],
  netCurrentCash: (_) => [],
  netCashAssets: (_) => [],
  netNonCashAssets: (_) => [],
  netWorth: (_) => [],
};

export {AccountBalancesServiceStub};

