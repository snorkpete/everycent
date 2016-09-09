import {Injectable} from "@angular/core";
import {ApiGateway} from "../core/api-gateway.service";
import {Observable} from "rxjs";

@Injectable()
export class AccountBalancesService{

  constructor(
    private apiGateway: ApiGateway
  ){}


  getAccountBalances(params): Observable<any>{
    return this.apiGateway.get('account_balances', params);
  }

  netWorth(bankAccounts: Array<any>): number{

    let net = 0;
    bankAccounts.forEach(bankAccount => {

      // do not include current accounts in the net worth calculation
      // ------------------------------------------------------------
      if(bankAccount.account_category !== 'current'){
        net += bankAccount.current_balance;
      }
    });

    return net;
  }
}
