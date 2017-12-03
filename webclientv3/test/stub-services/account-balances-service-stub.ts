import {Observable} from "rxjs/Observable";

const AccountBalancesServiceStub = {
  getAccountBalances$: (_) => Observable.of([]),
  totalAssets: (_) => [],
  totalLiabilities: (_) => [],
  netCurrentCash: (_) => [],
  netCashAssets: (_) => [],
  netNonCashAssets: (_) => [],
  netWorth: (_) => [],
};

export {AccountBalancesServiceStub};

